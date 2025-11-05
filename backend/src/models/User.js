const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Create a new user
   */
  static async create({ name, email, password, role, phone = null }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, phone, reputation_points, created_at`,
      [name, email, hashedPassword, role, phone]
    );

    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, role, phone, reputation_points, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user reputation
   */
  static async updateReputation(userId, points) {
    const result = await pool.query(
      'UPDATE users SET reputation_points = reputation_points + $1 WHERE id = $2 RETURNING reputation_points',
      [points, userId]
    );
    return result.rows[0];
  }

  /**
   * Get all users by role
   */
  static async findByRole(role) {
    const result = await pool.query(
      'SELECT id, name, email, role, reputation_points FROM users WHERE role = $1',
      [role]
    );
    return result.rows;
  }

  /**
   * Get user stats
   */
  static async getStats(userId) {
    const result = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.reputation_points,
        COUNT(DISTINCT i1.id) as reported_issues,
        COUNT(DISTINCT i2.id) as assigned_issues,
        COUNT(DISTINCT i3.id) as sponsored_issues
      FROM users u
      LEFT JOIN issues i1 ON i1.reported_by = u.id
      LEFT JOIN issues i2 ON i2.assigned_to = u.id
      LEFT JOIN issues i3 ON i3.sponsored_by = u.id
      WHERE u.id = $1
      GROUP BY u.id, u.name, u.reputation_points`,
      [userId]
    );
    return result.rows[0];
  }
}

module.exports = User;
