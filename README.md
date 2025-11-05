# Sahaay - Civic Problem Reporting Platform

**Transform citizen complaints into community action through volunteer coordination and business sponsorships.**

Sahaay is a full-stack web application that bridges the gap between civic problems and community solutions. Citizens report issues, AI intelligently categorizes them, volunteers step up to fix them, and local businesses sponsor the fixes for community goodwill.

## 🎯 Key Features

### 1. Citizen Problem Reporting
- Simple form to report civic issues (potholes, broken streetlights, garbage, etc.)
- Single photo upload per issue
- Browser geolocation for automatic location capture
- Issue status tracking (Reported → Assigned → In Progress → Resolved)

### 2. AI Integration (CRITICAL FEATURE)
The platform integrates AI in three powerful ways:

**🤖 AI-Powered Issue Categorization**
- Automatically categorizes issues into: Infrastructure, Cleanliness, Safety, or Other
- Assigns priority levels (Low/Medium/High) based on urgency and impact
- Provides reasoning for categorization decisions

**✨ AI Description Enhancement**
- Enhances brief user descriptions into clear, detailed problem statements
- Maintains factual accuracy while improving clarity

**🎯 AI Smart Volunteer Matching**
- Intelligently matches issues with volunteers based on skills and experience
- Considers volunteer reputation and completion history
- Provides reasoning for match recommendations

### 3. Volunteer Dashboard
- View all reported issues in the area
- "Pick Task" button to volunteer for issues
- Track personal issues and completion status
- Reputation points system (earn points for completed work)

### 4. Sponsor Dashboard
- Local businesses can browse issues needing funding
- "Sponsor This Fix" functionality with custom amounts
- Track sponsored issues and their progress
- Leaderboard showing top sponsors

### 5. Transparency Dashboard
- Public dashboard with real-time statistics
- Total issues reported/resolved metrics
- Active volunteers and sponsors count
- Total sponsorship amounts
- Recent resolutions with before/after photos
- Leaderboards for volunteers, sponsors, and reporters

### 6. Reputation System
- Citizens earn points for reporting valid issues
- Volunteers earn points for completing tasks (bonus for resolutions)
- Sponsors earn points based on funding amounts
- Public leaderboards for each category

## 🏗️ Tech Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **Anthropic Claude API** - AI integration

### Frontend
- **Next.js 14** - React framework with SSR
- **React 18** - UI components
- **Tailwind CSS** - Responsive styling
- **Axios** - API requests
- **Leaflet.js** - Map integration (planned)

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**
- **Anthropic API Key** (for AI features)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd SAHAAY
```

### 2. Database Setup

**Create PostgreSQL Database:**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sahaay_db;

# Exit psql
\q
```

### 3. Environment Configuration

**Create `.env` file in the root directory:**

```bash
cp .env.example .env
```

**Edit `.env` and add your configuration:**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sahaay_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# AI Integration (REQUIRED for AI features)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### 4. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (already done if you followed earlier steps)
npm install

# Initialize database tables
npm run init-db

# Seed demo data (optional but recommended)
npm run seed

# Start backend server
npm run dev
```

Backend will run on **http://localhost:5000**

### 5. Frontend Setup

```bash
# Open new terminal, navigate to frontend directory
cd frontend

# Install dependencies (already done if you followed earlier steps)
npm install

# Start frontend development server
npm run dev
```

Frontend will run on **http://localhost:3000**

## 🔑 Getting AI API Keys

The AI integration is **CRITICAL** for this project. Here's how to get your API key:

### Option 1: Anthropic Claude API (Recommended)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and add to `.env` as `ANTHROPIC_API_KEY`

### Option 2: Mock Mode

If you don't have an API key yet, the application will run in **MOCK MODE**:
- All AI features will return placeholder responses
- You can test the complete user flow
- Simply leave `ANTHROPIC_API_KEY` empty in `.env`

## 👥 Demo User Accounts

After running `npm run seed`, you can login with these accounts:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Citizen | citizen@test.com | password123 | Report issues |
| Volunteer | volunteer@test.com | password123 | Pick and resolve issues |
| Sponsor | sponsor@test.com | password123 | Fund issue fixes |
| Admin | admin@test.com | password123 | Full access |

## 📱 Using the Application

### For Citizens:

1. **Register** as a Citizen
2. Click **"Report Issue"** in navigation
3. Fill in issue details:
   - Title and description
   - Optionally click "Get AI Suggestions" for auto-categorization
   - Upload a photo
   - Click "Use My Location" or enter address manually
4. Submit the issue
5. Track your issue status on the dashboard

### For Volunteers:

1. **Register** as a Volunteer
2. Go to **"Volunteer"** dashboard
3. Browse **"Available Issues"** tab
4. Click **"Pick This Issue"** on any issue
5. View **"My Issues"** tab to see your assignments
6. Click on an issue to view details
7. Update status to **"In Progress"** when starting
8. Upload "after" photo when done
9. Mark as **"Resolved"** to complete

### For Sponsors:

1. **Register** as a Sponsor
2. Go to **"Sponsor"** dashboard
3. Browse issues needing sponsorship
4. Enter sponsorship amount
5. Click **"Sponsor This Fix"**
6. View your sponsored issues in **"My Sponsored Issues"** tab

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Issues
- `GET /api/issues` - Get all issues (with filters)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue (with image upload)
- `POST /api/issues/:id/pick` - Volunteer picks issue
- `POST /api/issues/:id/sponsor` - Sponsor an issue
- `PUT /api/issues/:id/status` - Update issue status
- `POST /api/issues/:id/after-image` - Upload after image
- `GET /api/issues/stats` - Get dashboard statistics

### AI Integration
- `POST /api/ai/categorize-issue` - Auto-categorize issue
- `POST /api/ai/enhance-description` - Enhance description
- `POST /api/ai/match-volunteer` - Smart volunteer matching

## 🗂️ Project Structure

```
SAHAAY/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & initialization
│   │   │   ├── database.js
│   │   │   ├── initDb.js
│   │   │   └── seedData.js
│   │   ├── controllers/     # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── issueController.js
│   │   │   └── aiController.js
│   │   ├── models/          # Database models
│   │   │   ├── User.js
│   │   │   ├── Issue.js
│   │   │   └── IssueActivity.js
│   │   ├── routes/          # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── issueRoutes.js
│   │   │   └── aiRoutes.js
│   │   ├── middleware/      # Custom middleware
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── services/        # Business logic
│   │   │   └── aiService.js (CRITICAL AI INTEGRATION)
│   │   └── server.js        # Express server
│   ├── uploads/             # Uploaded images
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Layout.js
│   │   │   └── IssueCard.js
│   │   ├── pages/           # Next.js pages
│   │   │   ├── index.js         (Home)
│   │   │   ├── login.js
│   │   │   ├── register.js
│   │   │   ├── dashboard.js
│   │   │   ├── report-issue.js
│   │   │   ├── volunteer.js
│   │   │   ├── sponsor.js
│   │   │   └── issues/[id].js
│   │   ├── services/        # API service
│   │   │   └── api.js
│   │   ├── utils/           # Utilities
│   │   │   └── AuthContext.js
│   │   └── styles/          # CSS styles
│   │       └── globals.css
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## ✅ Features Implementation Checklist

- [x] Citizen problem reporting with photo upload
- [x] Auto-capture location (browser geolocation)
- [x] AI-powered issue categorization
- [x] AI description enhancement
- [x] AI volunteer matching algorithm
- [x] Volunteer dashboard with task picking
- [x] Sponsor dashboard with funding
- [x] Progress tracking with timeline
- [x] Before/after photo comparison
- [x] Public transparency dashboard
- [x] Reputation system with leaderboards
- [x] User authentication (JWT)
- [x] Role-based access control
- [x] Responsive design (mobile & desktop)
- [x] API endpoints for all operations
- [x] Database with proper relationships

## 🧪 Testing the Complete Flow

Follow these steps to test the entire workflow:

1. **Start both servers** (backend and frontend)

2. **Register a Citizen account**
   - Go to http://localhost:3000
   - Click "Register"
   - Choose "Citizen" role
   - Complete registration

3. **Report an Issue**
   - Login as citizen
   - Click "Report Issue"
   - Enter issue details
   - Click "Get AI Suggestions" to test AI categorization
   - Upload a photo
   - Click "Use My Location"
   - Submit issue

4. **Volunteer picks the issue**
   - Logout and register new account as "Volunteer"
   - Go to "Volunteer" dashboard
   - Find your reported issue
   - Click "Pick This Issue"

5. **Sponsor funds the issue**
   - Logout and register new account as "Sponsor"
   - Go to "Sponsor" dashboard
   - Find the issue
   - Enter amount (e.g., $100)
   - Click "Sponsor This Fix"

6. **Resolve the issue**
   - Login back as the volunteer
   - Go to "My Issues"
   - Click on the issue
   - Update status to "In Progress"
   - Upload "after" photo
   - Mark as "Resolved"

7. **View on Dashboard**
   - Visit the public "Dashboard"
   - See the resolved issue
   - Check leaderboards
   - View statistics

## 🎓 AI Integration Details

The AI integration is the **core differentiator** of this platform. Here's how it works:

### File: `backend/src/services/aiService.js`

This service handles all AI operations:

1. **categorizeIssue(description, title)**
   - Analyzes the problem description
   - Returns: `{ category, priority, reasoning, aiCategorized }`
   - Falls back to default if API fails

2. **enhanceDescription(briefDescription, title)**
   - Takes brief descriptions and makes them clearer
   - Returns: `{ enhanced, wasEnhanced, message }`
   - Only enhances if description is < 100 characters

3. **matchVolunteer(issueDetails, availableVolunteers)**
   - Ranks volunteers by skills, experience, and reputation
   - Returns: `{ recommendedVolunteers, reasoning, aiMatched }`
   - Smart matching for optimal assignments

**Mock Mode:** If no API key is provided, all functions return safe defaults, allowing the app to run without AI.

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Role-based access control
- SQL injection prevention (parameterized queries)
- File upload validation (image types only)
- File size limits (5MB default)
- CORS protection

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Ensure PostgreSQL is running and credentials in `.env` are correct.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change `PORT` in `.env` or kill the process using the port.

### AI Features Not Working
```
⚠️ AI Service running in MOCK MODE
```
**Solution:** Add valid `ANTHROPIC_API_KEY` to `.env` file.

### Frontend Cannot Connect to Backend
**Solution:** Ensure `NEXT_PUBLIC_API_URL` in frontend `.env` matches backend URL.

## 📈 Future Enhancements

- Real-time notifications (WebSockets)
- Interactive map with issue markers
- Mobile app (React Native)
- SMS notifications
- Payment gateway for sponsorships
- Advanced analytics dashboard
- Multi-language support
- Email notifications
- Social media integration
- Volunteer skill verification

## 🤝 Contributing

This is a prototype built for demonstration. For production use:

1. Add comprehensive testing (Jest, React Testing Library)
2. Implement proper error logging (Winston, Sentry)
3. Add rate limiting
4. Implement caching (Redis)
5. Add comprehensive validation
6. Improve security headers
7. Add monitoring (Prometheus, Grafana)

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Built with Claude Code (AI-powered development)
- Anthropic Claude API for AI features
- Open source community for amazing tools

## 📞 Support

For issues and questions:
1. Check troubleshooting section above
2. Review API documentation
3. Check browser console for errors
4. Verify all environment variables are set

---

**Made with ❤️ for building better communities through civic engagement**

**Remember: The AI integration is what makes this platform special. Make sure to add your Anthropic API key for the full experience!**
