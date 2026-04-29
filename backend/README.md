# 🌸 MindBloom — Backend API

A complete Node.js + Express + MongoDB backend for the MindBloom Mental Health Companion App.

---

## 🗂️ Project Structure

```
mindbloom-backend/
├── server.js              ← Entry point (start here)
├── .env.example           ← Copy this to .env and fill values
├── .gitignore
├── package.json
│
├── models/
│   ├── User.js            ← User schema (auth, streak, wellness score)
│   ├── Mood.js            ← Daily mood check-in schema
│   └── JournalEntry.js    ← Journal entry + AI suggestion schema
│
├── routes/
│   ├── auth.js            ← POST /register, POST /login, GET /me
│   ├── mood.js            ← Log mood, mood history, weekly summary
│   ├── journal.js         ← CRUD for journal entries
│   ├── ai.js              ← OpenAI reflections, affirmations, crisis detection
│   ├── insights.js        ← Analytics, mood trends, patterns
│   └── user.js            ← Profile, preferences, password change
│
└── middleware/
    └── auth.js            ← JWT token verification (protects routes)
```

---

## ⚡ Quick Setup (Step by Step)

### Step 1 — Install Node.js
Download from: https://nodejs.org (choose LTS version)

### Step 2 — Clone / Download this folder
```bash
cd mindbloom-backend
```

### Step 3 — Install dependencies
```bash
npm install
```

### Step 4 — Set up MongoDB Atlas (Free Cloud Database)
1. Go to https://cloud.mongodb.com
2. Create a free account
3. Create a new cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://...`)

### Step 5 — Get OpenAI API Key
1. Go to https://platform.openai.com
2. Sign up / log in
3. Go to API Keys → Create new key
4. Copy the key (starts with `sk-proj-...`)

### Step 6 — Create your .env file
```bash
# Copy the example file
cp .env.example .env

# Then open .env and fill in your values:
# - MONGODB_URI = your MongoDB connection string
# - JWT_SECRET  = any long random string
# - OPENAI_API_KEY = your OpenAI key
```

### Step 7 — Start the server
```bash
# Development (auto-restarts on file changes)
npm run dev

# OR production
npm start
```

### Step 8 — Test it's working
Open your browser and visit: http://localhost:5000/health

You should see:
```json
{ "status": "ok", "message": "🌸 MindBloom API is running" }
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user (🔒 auth required) |

### Mood
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mood` | Log today's mood 🔒 |
| GET  | `/api/mood/today` | Get today's check-in 🔒 |
| GET  | `/api/mood/history?days=7` | Mood history 🔒 |
| GET  | `/api/mood/weekly-summary` | Avg mood by day of week 🔒 |

### Journal
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/journal` | Create entry 🔒 |
| GET    | `/api/journal` | Get all entries (paginated) 🔒 |
| GET    | `/api/journal/:id` | Get single entry 🔒 |
| PATCH  | `/api/journal/:id` | Update entry 🔒 |
| DELETE | `/api/journal/:id` | Delete entry 🔒 |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/reflect` | Get AI reflection on journal entry 🔒 |
| POST | `/api/ai/affirmation` | Get personalized affirmation 🔒 |
| POST | `/api/ai/breathing-tip` | Get breathing tip 🔒 |
| POST | `/api/ai/gratitude-prompt` | Get gratitude prompt 🔒 |

### Insights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/insights/overview` | Full analytics dashboard 🔒 |
| GET | `/api/insights/mood-trend?days=30` | Raw mood data for charts 🔒 |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET   | `/api/user/profile` | Get full profile 🔒 |
| PATCH | `/api/user/profile` | Update name/avatar 🔒 |
| PATCH | `/api/user/preferences` | Update settings 🔒 |
| POST  | `/api/user/change-password` | Change password 🔒 |

🔒 = Requires `Authorization: Bearer <token>` header

---

## 🧪 Testing the API

Use **Postman** or **Thunder Client** (VS Code extension):

**Register:**
```json
POST http://localhost:5000/api/auth/register
{
  "name": "Arjun",
  "email": "arjun@example.com",
  "password": "password123"
}
```

**Login:**
```json
POST http://localhost:5000/api/auth/login
{
  "email": "arjun@example.com",
  "password": "password123"
}
```
→ Copy the `token` from the response

**Log mood (with token):**
```
POST http://localhost:5000/api/mood
Authorization: Bearer <paste token here>
{
  "moodLevel": 4,
  "energyLevel": 7
}
```

---

## 🔗 Connecting to Frontend

In your React app, call the API like this:

```javascript
// Example: Login from React
const login = async (email, password) => {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  localStorage.setItem('token', data.token); // save token
};

// Example: Get AI reflection (authenticated)
const getReflection = async (entryId, content) => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/ai/reflect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`   // send token!
    },
    body: JSON.stringify({ entryId, content })
  });
  return res.json();
};
```

---

## 🛡️ Security Features Built In

- ✅ Passwords hashed with bcrypt (12 salt rounds)
- ✅ JWT authentication on all private routes
- ✅ Rate limiting (100 req/15min, 10 auth req/15min)
- ✅ Helmet.js security headers
- ✅ Input validation on all routes
- ✅ Crisis keyword detection before AI processing
- ✅ User can only access their own data

---

## 🚀 Deploy to Production

**Backend → Render.com (Free)**
1. Push code to GitHub (make sure .env is in .gitignore!)
2. Go to render.com → New Web Service
3. Connect your GitHub repo
4. Add environment variables in Render dashboard
5. Deploy!

**Database → MongoDB Atlas** (already cloud-based, no extra steps)
