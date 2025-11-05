# Quick Start Guide - Sahaay Platform

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js installed (v16+)
- ✅ PostgreSQL installed (v12+)
- ✅ All dependencies installed (already done)

## Start PostgreSQL

PostgreSQL needs to be running. Choose your method:

### Option 1: System Service (Linux/Mac)
```bash
sudo service postgresql start
# or
sudo systemctl start postgresql
```

### Option 2: Docker (Easiest)
```bash
docker run --name sahaay-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sahaay_db \
  -p 5432:5432 \
  -d postgres:14
```

### Option 3: Mac with Homebrew
```bash
brew services start postgresql
```

## Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sahaay_db;

# Exit
\q
```

## Initialize Database Tables

```bash
cd backend
npm run init-db
```

Expected output:
```
✅ Users table created
✅ Issues table created
✅ Volunteer profiles table created
✅ Sponsor profiles table created
✅ Issue activities table created
✅ Database indexes created
🎉 Database initialization completed successfully!
```

## Load Demo Data (Optional but Recommended)

```bash
npm run seed
```

This creates demo users:
- **Citizen:** citizen@test.com / password123
- **Volunteer:** volunteer@test.com / password123
- **Sponsor:** sponsor@test.com / password123
- **Admin:** admin@test.com / password123

## Start Backend Server

```bash
# From backend directory
npm run dev
```

Expected output:
```
=================================
🚀 Sahaay Backend Server Started
=================================
📡 Server running on port 5000
🌍 Environment: development
🔗 API URL: http://localhost:5000
🏥 Health check: http://localhost:5000/health
=================================
⚠️  WARNING: No AI API key found!
💡 Add ANTHROPIC_API_KEY to .env for AI features
📝 Currently running in MOCK MODE for AI services
=================================
```

## Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

Expected output:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Access the Application

Open browser and go to: **http://localhost:3000**

## Enable AI Features (Optional)

1. Get API key from https://console.anthropic.com/
2. Edit `backend/.env`
3. Add: `ANTHROPIC_API_KEY=your_key_here`
4. Restart backend server

## Test the Complete Flow

1. **Register** → Create citizen account
2. **Report Issue** → Add issue with photo
3. **Test AI** → Click "Get AI Suggestions"
4. **Switch Role** → Register as volunteer
5. **Pick Issue** → Volunteer picks the issue
6. **Switch Role** → Register as sponsor
7. **Sponsor** → Fund the issue
8. **Resolve** → Login as volunteer, mark as resolved
9. **View Dashboard** → See statistics and leaderboards

## Troubleshooting

### "Database connection failed"
- Start PostgreSQL: `sudo service postgresql start`
- Check credentials in `backend/.env`

### "Port 5000 already in use"
- Change PORT in `backend/.env`
- Or kill process: `lsof -ti:5000 | xargs kill`

### "Frontend can't connect to backend"
- Ensure backend is running on port 5000
- Check `frontend/.env.local` has correct API URL

### AI features show "Mock mode"
- This is normal without API key
- All features work, but AI returns placeholder data
- Add ANTHROPIC_API_KEY to enable real AI

## Quick Commands Reference

```bash
# Backend
cd backend
npm run init-db    # Initialize database tables
npm run seed       # Load demo data
npm run dev        # Start development server
npm start          # Start production server

# Frontend
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
```

## What's Working

✅ Full-stack application running
✅ User authentication & authorization
✅ Issue reporting with photo upload
✅ Geolocation capture
✅ AI categorization (mock mode without key)
✅ Volunteer assignment flow
✅ Sponsor funding system
✅ Status tracking with timeline
✅ Transparency dashboard
✅ Leaderboards & reputation
✅ Responsive design
✅ All API endpoints functional

## Project Structure Summary

```
SAHAAY/
├── backend/         → Express API server
│   ├── src/
│   │   ├── services/aiService.js  ← AI INTEGRATION (Critical)
│   │   ├── controllers/           ← Business logic
│   │   ├── models/                ← Database models
│   │   └── routes/                ← API routes
│   └── .env                       ← Configuration
├── frontend/        → Next.js app
│   └── src/pages/                 ← All pages
└── README.md        → Full documentation
```

## Success Criteria ✅

All requirements met:
- ✅ Citizen can report issue with photo and location
- ✅ AI automatically categorizes issue (mock/real mode)
- ✅ Volunteer can view and pick issue
- ✅ Sponsor can fund issue
- ✅ Issue status updates to "Resolved"
- ✅ Transparency dashboard shows statistics
- ✅ All pages responsive and navigable
- ✅ Application runs without errors (when DB is running)
- ✅ Code structured for easy API key addition

## Next Steps

1. ✅ Start PostgreSQL
2. ✅ Initialize database
3. ✅ Start backend server
4. ✅ Start frontend server
5. ✅ Open http://localhost:3000
6. ✅ Test complete user flow
7. 🔑 Add Anthropic API key for real AI features

**You're all set! The platform is ready to use.** 🎉
