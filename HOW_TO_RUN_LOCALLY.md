# 🚀 How to Run Sahaay Locally on Your Laptop

## Quick Start (Copy-Paste Commands)

### Prerequisites (One-Time Install)
You need:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** - [Download here](https://www.postgresql.org/download/)

**Install PostgreSQL:**
```bash
# Mac (with Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start

# Windows
# Download installer from https://www.postgresql.org/download/windows/
# Then run it and follow the wizard
```

---

## 🎯 Running the Application (Every Time)

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd SAHAAY
```

### Step 2: Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create the database (only first time)
# Mac/Linux:
psql -U postgres -c "CREATE DATABASE sahaay_db;"

# Windows (using psql from command prompt):
psql -U postgres
CREATE DATABASE sahaay_db;
\q

# Initialize database tables (only first time)
npm run init-db

# Load demo data (optional, recommended for testing)
npm run seed

# Start backend server
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Sahaay Backend Server Started
📡 Server running on port 5000
```

### Step 3: Setup Frontend (New Terminal Window)
```bash
# Open NEW terminal/command prompt
cd SAHAAY/frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

You should see:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
✓ Ready in 2.6s
```

### Step 4: Open Your Browser
Go to: **http://localhost:3000**

🎉 **You should see the Sahaay homepage!**

---

## 👥 Demo User Accounts (From Seed Data)

| Role | Email | Password | What You Can Do |
|------|-------|----------|-----------------|
| **Citizen** | citizen@test.com | password123 | Report issues |
| **Volunteer** | volunteer@test.com | password123 | Pick & resolve issues |
| **Sponsor** | sponsor@test.com | password123 | Fund issues |
| **Admin** | admin@test.com | password123 | Full access |

---

## 🧪 Testing the Complete Flow

1. **Login as Citizen** (citizen@test.com / password123)
   - Click "Report Issue"
   - Fill in details: title, description
   - Click "Get AI Suggestions" (will use mock mode without API key)
   - Upload a photo (optional)
   - Click "Use My Location" or enter address
   - Submit issue

2. **Switch to Volunteer** (logout → login as volunteer@test.com)
   - Go to "Volunteer" dashboard
   - See your reported issue in "Available Issues"
   - Click "Pick This Issue"
   - Issue moves to "My Issues"

3. **Switch to Sponsor** (logout → login as sponsor@test.com)
   - Go to "Sponsor" dashboard
   - Find the issue in "Available to Sponsor"
   - Enter amount (e.g., 100)
   - Click "Sponsor This Fix"

4. **Back to Volunteer** (login as volunteer@test.com)
   - Go to "My Issues"
   - Click on the issue
   - Click "Mark as In Progress"
   - Upload "after" photo (optional)
   - Click "Mark as Resolved"

5. **View Dashboard** (can view without login)
   - Go to "Dashboard" in navigation
   - See statistics updated
   - Check leaderboards
   - View recently resolved issues

---

## 🐛 Common Issues & Solutions

### Issue 1: "Port 5000 already in use"
**Solution:**
```bash
# Find and kill process on port 5000
# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
# Note the PID, then:
taskkill /PID <PID> /F
```

### Issue 2: "Database connection failed"
**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
# Mac:
brew services list
brew services start postgresql@16

# Ubuntu/Linux:
sudo service postgresql status
sudo service postgresql start

# Windows:
# Check Services app → PostgreSQL should be running
```

### Issue 3: "Database does not exist"
**Error:** `database "sahaay_db" does not exist`

**Solution:**
```bash
psql -U postgres -c "CREATE DATABASE sahaay_db;"
cd backend
npm run init-db
```

### Issue 4: "Password authentication failed"
**Error:** `password authentication failed for user "postgres"`

**Solution:** Update `backend/.env` file:
```env
DB_PASSWORD=your_postgres_password
```

Then restart backend:
```bash
# Stop backend (Ctrl+C)
npm run dev
```

### Issue 5: Frontend shows blank page
**Solution:**
1. Check browser console (F12) for errors
2. Make sure backend is running (check http://localhost:5000/health)
3. Clear browser cache and reload

### Issue 6: "AI features not working"
**Note:** This is expected! AI runs in MOCK MODE without API key.

**To enable real AI:**
1. Get API key from https://console.anthropic.com/
2. Add to `backend/.env`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```
3. Restart backend

---

## 🔧 Useful Commands

### Backend Commands
```bash
cd backend

npm run dev          # Start development server
npm start            # Start production server
npm run init-db      # Initialize database tables
npm run seed         # Load demo data
```

### Frontend Commands
```bash
cd frontend

npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

### Database Commands
```bash
# Connect to database
psql -U postgres sahaay_db

# View all tables
\dt

# View users
SELECT * FROM users;

# View issues
SELECT * FROM issues;

# Exit
\q
```

---

## 🛑 Stopping the Application

1. **Stop Backend:** Go to terminal running backend, press `Ctrl+C`
2. **Stop Frontend:** Go to terminal running frontend, press `Ctrl+C`
3. **Stop PostgreSQL** (if you want):
   ```bash
   # Mac:
   brew services stop postgresql@16

   # Linux:
   sudo service postgresql stop

   # Windows: Stop from Services app
   ```

---

## ⏱️ Quick Restart (After First Setup)

Next time you want to run the app:

```bash
# Terminal 1 - Backend
cd SAHAAY/backend
npm run dev

# Terminal 2 - Frontend
cd SAHAAY/frontend
npm run dev

# Browser
# Open http://localhost:3000
```

That's it! Takes ~30 seconds after first setup.

---

## 📊 What's Included

- ✅ 4 demo issues (1 resolved, 1 in progress, 1 assigned, 1 pending)
- ✅ 7 demo users (2 citizens, 2 volunteers, 2 sponsors, 1 admin)
- ✅ Activity logs and timeline
- ✅ Reputation points already assigned
- ✅ Sample sponsorships ($350 total)

---

## 🆘 Need Help?

If you encounter issues:

1. **Check the error message** - usually tells you what's wrong
2. **Check this guide** - solutions to common issues above
3. **Check logs:**
   - Backend: Look at terminal running backend
   - Frontend: Look at terminal running frontend
   - Browser: Press F12 → Console tab
4. **Report the issue** - Let me know the error message and I'll help fix it!

---

## 📝 Notes

- **First run** takes longer (downloading dependencies)
- **Subsequent runs** are much faster (~30 seconds)
- **Demo data** resets when you run `npm run seed` again
- **AI features** work in mock mode without API key
- **All features** are fully functional locally

---

## ✅ Checklist Before You Start

- [ ] Node.js installed (check: `node --version`)
- [ ] PostgreSQL installed (check: `psql --version`)
- [ ] PostgreSQL running (check: `pg_isready` or check Services)
- [ ] Repository cloned
- [ ] Ready to test!

---

**Happy testing! Let me know if you find any issues and I'll fix them right away!** 🚀
