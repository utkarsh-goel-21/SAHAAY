const pool = require('./database');

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log('🔧 Creating database tables...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('citizen', 'volunteer', 'sponsor', 'admin')),
        phone VARCHAR(20),
        reputation_points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Issues table
    await client.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        enhanced_description TEXT,
        category VARCHAR(100) NOT NULL CHECK (category IN ('Infrastructure', 'Cleanliness', 'Safety', 'Other')),
        priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
        status VARCHAR(50) DEFAULT 'Reported' CHECK (status IN ('Reported', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        location_address TEXT,
        image_url VARCHAR(500),
        reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        sponsored_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        sponsor_amount DECIMAL(10, 2) DEFAULT 0,
        ai_categorized BOOLEAN DEFAULT FALSE,
        ai_reasoning TEXT,
        resolved_at TIMESTAMP,
        before_image_url VARCHAR(500),
        after_image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Issues table created');

    // Volunteer profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS volunteer_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        skills TEXT[],
        availability VARCHAR(100),
        issues_completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Volunteer profiles table created');

    // Sponsor profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sponsor_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255),
        business_type VARCHAR(100),
        total_sponsored DECIMAL(10, 2) DEFAULT 0,
        issues_sponsored INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Sponsor profiles table created');

    // Issue timeline/activity log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS issue_activities (
        id SERIAL PRIMARY KEY,
        issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        activity_type VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Issue activities table created');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
      CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
      CREATE INDEX IF NOT EXISTS idx_issues_reported_by ON issues(reported_by);
      CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_issue_activities_issue_id ON issue_activities(issue_id);
    `);
    console.log('✅ Database indexes created');

    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('✅ Database setup complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Database setup failed:', err);
      process.exit(1);
    });
}

module.exports = { createTables };
