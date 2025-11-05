const pool = require('../config/database');

class Issue {
  /**
   * Create a new issue
   */
  static async create(issueData) {
    const {
      title,
      description,
      enhanced_description,
      category,
      priority,
      location_lat,
      location_lng,
      location_address,
      image_url,
      reported_by,
      ai_categorized,
      ai_reasoning
    } = issueData;

    const result = await pool.query(
      `INSERT INTO issues (
        title, description, enhanced_description, category, priority,
        location_lat, location_lng, location_address, image_url,
        reported_by, ai_categorized, ai_reasoning
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        title,
        description,
        enhanced_description,
        category,
        priority,
        location_lat,
        location_lng,
        location_address,
        image_url,
        reported_by,
        ai_categorized,
        ai_reasoning
      ]
    );

    return result.rows[0];
  }

  /**
   * Get all issues with optional filters
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT i.*,
        u1.name as reporter_name,
        u2.name as volunteer_name,
        u3.name as sponsor_name
      FROM issues i
      LEFT JOIN users u1 ON i.reported_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      LEFT JOIN users u3 ON i.sponsored_by = u3.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.category) {
      query += ` AND i.category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    if (filters.reported_by) {
      query += ` AND i.reported_by = $${paramCount}`;
      params.push(filters.reported_by);
      paramCount++;
    }

    if (filters.assigned_to) {
      query += ` AND i.assigned_to = $${paramCount}`;
      params.push(filters.assigned_to);
      paramCount++;
    }

    query += ' ORDER BY i.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get issue by ID
   */
  static async findById(id) {
    const result = await pool.query(
      `SELECT i.*,
        u1.name as reporter_name, u1.email as reporter_email,
        u2.name as volunteer_name, u2.email as volunteer_email,
        u3.name as sponsor_name, u3.email as sponsor_email
      FROM issues i
      LEFT JOIN users u1 ON i.reported_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      LEFT JOIN users u3 ON i.sponsored_by = u3.id
      WHERE i.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Update issue status
   */
  static async updateStatus(id, status) {
    const resolved_at = status === 'Resolved' ? 'CURRENT_TIMESTAMP' : null;
    const result = await pool.query(
      `UPDATE issues
       SET status = $1,
           resolved_at = ${resolved_at ? resolved_at : 'resolved_at'},
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  }

  /**
   * Assign volunteer to issue
   */
  static async assignVolunteer(issueId, volunteerId) {
    const result = await pool.query(
      `UPDATE issues
       SET assigned_to = $1,
           status = 'Assigned',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [volunteerId, issueId]
    );
    return result.rows[0];
  }

  /**
   * Add sponsor to issue
   */
  static async addSponsor(issueId, sponsorId, amount) {
    const result = await pool.query(
      `UPDATE issues
       SET sponsored_by = $1,
           sponsor_amount = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [sponsorId, amount, issueId]
    );
    return result.rows[0];
  }

  /**
   * Update issue with after image (when resolved)
   */
  static async updateAfterImage(issueId, afterImageUrl) {
    const result = await pool.query(
      `UPDATE issues
       SET after_image_url = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [afterImageUrl, issueId]
    );
    return result.rows[0];
  }

  /**
   * Get dashboard statistics
   */
  static async getStats() {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_issues,
        COUNT(*) FILTER (WHERE status = 'Resolved') as resolved_issues,
        COUNT(*) FILTER (WHERE status = 'Reported') as pending_issues,
        COUNT(*) FILTER (WHERE status = 'Assigned' OR status = 'In Progress') as active_issues,
        COALESCE(SUM(sponsor_amount), 0) as total_sponsorship,
        COUNT(DISTINCT assigned_to) FILTER (WHERE assigned_to IS NOT NULL) as active_volunteers,
        COUNT(DISTINCT sponsored_by) FILTER (WHERE sponsored_by IS NOT NULL) as active_sponsors
      FROM issues
    `);
    return result.rows[0];
  }

  /**
   * Get recent resolved issues for transparency dashboard
   */
  static async getRecentResolved(limit = 10) {
    const result = await pool.query(
      `SELECT i.*,
        u1.name as reporter_name,
        u2.name as volunteer_name,
        u3.name as sponsor_name
      FROM issues i
      LEFT JOIN users u1 ON i.reported_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      LEFT JOIN users u3 ON i.sponsored_by = u3.id
      WHERE i.status = 'Resolved'
      ORDER BY i.resolved_at DESC
      LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  /**
   * Get leaderboards
   */
  static async getLeaderboards() {
    // Top volunteers
    const volunteers = await pool.query(`
      SELECT u.id, u.name, u.reputation_points,
        COUNT(i.id) as issues_completed
      FROM users u
      LEFT JOIN issues i ON i.assigned_to = u.id AND i.status = 'Resolved'
      WHERE u.role = 'volunteer'
      GROUP BY u.id, u.name, u.reputation_points
      ORDER BY issues_completed DESC, u.reputation_points DESC
      LIMIT 10
    `);

    // Top sponsors
    const sponsors = await pool.query(`
      SELECT u.id, u.name,
        COUNT(DISTINCT i.id) as issues_sponsored,
        COALESCE(SUM(i.sponsor_amount), 0) as total_amount
      FROM users u
      LEFT JOIN issues i ON i.sponsored_by = u.id
      WHERE u.role = 'sponsor'
      GROUP BY u.id, u.name
      ORDER BY total_amount DESC
      LIMIT 10
    `);

    // Top reporters
    const reporters = await pool.query(`
      SELECT u.id, u.name, u.reputation_points,
        COUNT(i.id) as issues_reported
      FROM users u
      LEFT JOIN issues i ON i.reported_by = u.id
      WHERE u.role = 'citizen'
      GROUP BY u.id, u.name, u.reputation_points
      ORDER BY issues_reported DESC, u.reputation_points DESC
      LIMIT 10
    `);

    return {
      volunteers: volunteers.rows,
      sponsors: sponsors.rows,
      reporters: reporters.rows
    };
  }
}

module.exports = Issue;
