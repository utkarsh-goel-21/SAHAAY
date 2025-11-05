const pool = require('./database');
const bcrypt = require('bcryptjs');

async function seedData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting to seed data...');

    // Hash password for all demo users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create demo users
    console.log('Creating demo users...');

    // Citizens
    await client.query(`
      INSERT INTO users (name, email, password, role, phone, reputation_points)
      VALUES
        ('John Citizen', 'citizen@test.com', $1, 'citizen', '555-1234', 5),
        ('Jane Reporter', 'jane@test.com', $1, 'citizen', '555-5678', 3)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    // Volunteers
    await client.query(`
      INSERT INTO users (name, email, password, role, phone, reputation_points)
      VALUES
        ('Mike Volunteer', 'volunteer@test.com', $1, 'volunteer', '555-9012', 10),
        ('Sarah Helper', 'sarah@test.com', $1, 'volunteer', '555-3456', 8)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    // Sponsors
    await client.query(`
      INSERT INTO users (name, email, password, role, phone, reputation_points)
      VALUES
        ('Local Business Inc', 'sponsor@test.com', $1, 'sponsor', '555-7890', 15),
        ('Community Foundation', 'foundation@test.com', $1, 'sponsor', '555-2468', 12)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    // Admin
    await client.query(`
      INSERT INTO users (name, email, password, role, phone, reputation_points)
      VALUES
        ('Admin User', 'admin@test.com', $1, 'admin', '555-0000', 100)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    console.log('✅ Demo users created');
    console.log('');
    console.log('Demo Users Login Info:');
    console.log('  Citizen:   citizen@test.com / password123');
    console.log('  Volunteer: volunteer@test.com / password123');
    console.log('  Sponsor:   sponsor@test.com / password123');
    console.log('  Admin:     admin@test.com / password123');
    console.log('');

    // Get user IDs
    const citizenResult = await client.query(`SELECT id FROM users WHERE email = 'citizen@test.com'`);
    const volunteerResult = await client.query(`SELECT id FROM users WHERE email = 'volunteer@test.com'`);
    const sponsorResult = await client.query(`SELECT id FROM users WHERE email = 'sponsor@test.com'`);

    if (citizenResult.rows.length === 0) {
      console.log('⚠️  No users found - seed data may already exist');
      return;
    }

    const citizenId = citizenResult.rows[0].id;
    const volunteerId = volunteerResult.rows[0].id;
    const sponsorId = sponsorResult.rows[0].id;

    // Create demo issues
    console.log('Creating demo issues...');

    // Issue 1: Reported
    await client.query(`
      INSERT INTO issues (
        title, description, enhanced_description, category, priority,
        status, location_address, location_lat, location_lng,
        reported_by, ai_categorized, ai_reasoning
      )
      VALUES (
        'Large Pothole on Main Street',
        'Dangerous pothole near the intersection causing vehicle damage',
        'A significant pothole has developed on Main Street near the central intersection, approximately 2 feet in diameter and 6 inches deep. The damage is causing vehicles to swerve dangerously and has already resulted in tire damage to multiple cars.',
        'Infrastructure',
        'High',
        'Reported',
        '123 Main Street',
        40.7128,
        -74.0060,
        $1,
        true,
        'Categorized as Infrastructure due to road damage. High priority due to safety risk to vehicles.'
      )
    `, [citizenId]);

    // Issue 2: Assigned to volunteer
    const issue2 = await client.query(`
      INSERT INTO issues (
        title, description, category, priority,
        status, location_address, location_lat, location_lng,
        reported_by, assigned_to, ai_categorized
      )
      VALUES (
        'Broken Street Light',
        'Street light not working on Oak Avenue creating safety hazard',
        'Safety',
        'High',
        'Assigned',
        '456 Oak Avenue',
        40.7589,
        -73.9851,
        $1,
        $2,
        true
      )
      RETURNING id
    `, [citizenId, volunteerId]);

    // Issue 3: In Progress with sponsor
    const issue3 = await client.query(`
      INSERT INTO issues (
        title, description, category, priority,
        status, location_address, location_lat, location_lng,
        reported_by, assigned_to, sponsored_by, sponsor_amount, ai_categorized
      )
      VALUES (
        'Illegal Dumping Site',
        'Large pile of garbage dumped in community park',
        'Cleanliness',
        'Medium',
        'In Progress',
        '789 Park Lane',
        40.7489,
        -73.9680,
        $1,
        $2,
        $3,
        250.00,
        true
      )
      RETURNING id
    `, [citizenId, volunteerId, sponsorId]);

    // Issue 4: Resolved
    const issue4 = await client.query(`
      INSERT INTO issues (
        title, description, category, priority,
        status, location_address, location_lat, location_lng,
        reported_by, assigned_to, sponsored_by, sponsor_amount,
        resolved_at, ai_categorized
      )
      VALUES (
        'Graffiti on Public Wall',
        'Vandalism on community center wall',
        'Other',
        'Low',
        'Resolved',
        '321 Community Drive',
        40.7305,
        -73.9350,
        $1,
        $2,
        $3,
        100.00,
        CURRENT_TIMESTAMP,
        true
      )
      RETURNING id
    `, [citizenId, volunteerId, sponsorId]);

    console.log('✅ Demo issues created');

    // Create activity logs for issues
    console.log('Creating activity logs...');

    await client.query(`
      INSERT INTO issue_activities (issue_id, user_id, activity_type, description)
      VALUES
        ($1, $2, 'VOLUNTEER_ASSIGNED', 'Mike Volunteer volunteered to work on this issue'),
        ($1, $2, 'STATUS_CHANGED', 'Status changed from Reported to Assigned')
    `, [issue2.rows[0].id, volunteerId]);

    await client.query(`
      INSERT INTO issue_activities (issue_id, user_id, activity_type, description)
      VALUES
        ($1, $2, 'VOLUNTEER_ASSIGNED', 'Mike Volunteer volunteered to work on this issue'),
        ($1, $3, 'SPONSOR_ADDED', 'Local Business Inc sponsored this issue with $250'),
        ($1, $2, 'STATUS_CHANGED', 'Status changed from Assigned to In Progress')
    `, [issue3.rows[0].id, volunteerId, sponsorId]);

    await client.query(`
      INSERT INTO issue_activities (issue_id, user_id, activity_type, description)
      VALUES
        ($1, $2, 'VOLUNTEER_ASSIGNED', 'Mike Volunteer volunteered to work on this issue'),
        ($1, $3, 'SPONSOR_ADDED', 'Local Business Inc sponsored this issue with $100'),
        ($1, $2, 'STATUS_CHANGED', 'Status changed from In Progress to Resolved'),
        ($1, $2, 'ISSUE_RESOLVED', 'Issue was marked as resolved by Mike Volunteer')
    `, [issue4.rows[0].id, volunteerId, sponsorId]);

    console.log('✅ Activity logs created');

    console.log('\n🎉 Seed data completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Start the backend: cd backend && npm run dev');
    console.log('2. Start the frontend: cd frontend && npm run dev');
    console.log('3. Login with any demo user credentials above');
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Seed complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    });
}

module.exports = { seedData };
