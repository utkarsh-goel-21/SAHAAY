const pool = require('../config/database');

class IssueActivity {
  /**
   * Create a new activity log entry
   */
  static async create(issueId, userId, activityType, description) {
    const result = await pool.query(
      `INSERT INTO issue_activities (issue_id, user_id, activity_type, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [issueId, userId, activityType, description]
    );
    return result.rows[0];
  }

  /**
   * Get all activities for an issue
   */
  static async findByIssueId(issueId) {
    const result = await pool.query(
      `SELECT ia.*, u.name as user_name
       FROM issue_activities ia
       LEFT JOIN users u ON ia.user_id = u.id
       WHERE ia.issue_id = $1
       ORDER BY ia.created_at ASC`,
      [issueId]
    );
    return result.rows;
  }

  /**
   * Log issue creation
   */
  static async logIssueCreated(issueId, userId, issueTitle) {
    return this.create(
      issueId,
      userId,
      'ISSUE_CREATED',
      `Issue "${issueTitle}" was reported`
    );
  }

  /**
   * Log volunteer assignment
   */
  static async logVolunteerAssigned(issueId, volunteerId, volunteerName) {
    return this.create(
      issueId,
      volunteerId,
      'VOLUNTEER_ASSIGNED',
      `${volunteerName} volunteered to work on this issue`
    );
  }

  /**
   * Log sponsor added
   */
  static async logSponsorAdded(issueId, sponsorId, sponsorName, amount) {
    return this.create(
      issueId,
      sponsorId,
      'SPONSOR_ADDED',
      `${sponsorName} sponsored this issue with $${amount}`
    );
  }

  /**
   * Log status change
   */
  static async logStatusChange(issueId, userId, oldStatus, newStatus) {
    return this.create(
      issueId,
      userId,
      'STATUS_CHANGED',
      `Status changed from ${oldStatus} to ${newStatus}`
    );
  }

  /**
   * Log issue resolution
   */
  static async logIssueResolved(issueId, volunteerId, volunteerName) {
    return this.create(
      issueId,
      volunteerId,
      'ISSUE_RESOLVED',
      `Issue was marked as resolved by ${volunteerName}`
    );
  }
}

module.exports = IssueActivity;
