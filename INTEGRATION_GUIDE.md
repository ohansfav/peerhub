# Peerup Integration Guide

## Overview

Peerup is a full-stack tutoring platform consisting of:
- **Backend (Server)**: Node.js/Express API running on port 3000
- **Frontend (Client)**: React/Vite app running on port 5173

Both communicate via REST API calls over HTTP.

---

## Architecture

```
┌─────────────────────────────────────┐
│   CLIENT (Port 5173)                │
│   - React 19 + Vite                 │
│   - React Router                    │
│   - React Query                     │
│   - TailwindCSS + DaisyUI           │
│   - Axios (API calls)               │
└────────────────┬────────────────────┘
                 │ HTTP API Calls
                 │ (http://localhost:3000/api)
                 ▼
┌─────────────────────────────────────┐
│   SERVER (Port 3000)                │
│   - Express.js                      │
│   - PostgreSQL / SQLite             │
│   - Sequelize ORM                   │
│   - JWT Authentication              │
│   - Stream Chat Integration         │
└─────────────────────────────────────┘
```

---

## Project Structure

```
final year project 3/
├── server/                    # Backend API
│   ├── src/
│   │   ├── server.js         # Main entry point
│   │   ├── routes/           # API endpoints
│   │   ├── models/           # Database models
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Middleware (auth, etc.)
│   │   └── config/           # Configuration files
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── README.md
│
└── client/                    # Frontend app
    ├── src/
    │   ├── main.jsx          # React entry point
    │   ├── App.jsx           # Main component
    │   ├── pages/            # Page components
    │   ├── components/       # Reusable components
    │   ├── services/         # API service layer
    │   ├── hooks/            # Custom React hooks
    │   └── assets/           # Images, styles, etc.
    ├── .env                  # Environment variables
    ├── vite.config.js        # Vite configuration
    ├── package.json
    └── README.md
```

---

## Setup Instructions

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **PostgreSQL** (optional, SQLite can be used for development)

### Step 1: Install Dependencies

Both `npm install` commands have already been run for:
- ✅ Server: `npm install` in `/server`
- ✅ Client: `npm install` in `/client`

### Step 2: Environment Configuration

#### Server Configuration (`.env`)

Already created with sensible development defaults:
```env
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=your_development_jwt_secret_change_in_production_12345
DB_DIALECT=sqlite  # Uses SQLite for easy development, no DB setup needed
```

To use PostgreSQL instead:
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_USER=postgres
DB_PASS=your_password
DB_NAME=edupeerup_db
DB_SSL=false
```

#### Client Configuration (`.env`)

Already created:
```env
VITE_API_URL=http://localhost:3000/api
VITE_STREAM_API_KEY=your-stream-api-key
```

### Step 3: Database Setup (Server)

If using PostgreSQL, create the database:
```bash
createdb edupeerup_db
```

Then run migrations (from server directory):
```bash
npm run migrate
```

For SQLite, migrations will create the database automatically.

### Step 4: Running the Application

#### Terminal 1 - Start Backend Server

```bash
cd server
npm run dev
```

Expected output:
```
Server running on http://localhost:3000
API available at http://localhost:3000/api
```

#### Terminal 2 - Start Frontend Application

```bash
cd client
npm run dev
```

Expected output:
```
VITE v7.0.4  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## How They Communicate

### API Endpoints

The frontend makes requests to the backend using Axios:

**Example Flow:**
1. User enters login credentials on the frontend
2. Frontend makes POST request to `http://localhost:3000/api/auth/login`
3. Backend verifies credentials and returns JWT token
4. Frontend stores token in localStorage/cookies
5. Frontend includes token in subsequent requests via Authorization header

**Common API Routes** (from backend):
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/students` - Fetch students
- `GET /api/tutors` - Fetch tutors
- `POST /api/sessions` - Create tutoring session
- `GET /api/sessions/:id` - Get session details
- `POST /api/messages` - Send message

### Authentication

- Backend uses **JWT (JSON Web Tokens)** for authentication
- Frontend stores JWT received from login
- All subsequent requests include JWT in `Authorization: Bearer <token>` header
- Backend middleware validates token on protected routes

### Real-Time Features

- **Stream Chat**: Used for messaging between tutors and students
- Requires Stream API credentials (optional for basic testing)
- Enables real-time chat without polling

---

## Available Scripts

### Server

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
npm test             # Run tests
npm run lint         # Check for linting errors
npm run lint:fix     # Fix linting errors
```

### Client

```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check for linting errors
```

---

## Common Issues & Solutions

### Issue 1: "Cannot connect to http://localhost:3000"

**Solution**: Make sure the server is running in a separate terminal:
```bash
cd server && npm run dev
```

### Issue 2: "VITE_API_URL is not defined"

**Solution**: Restart the client development server after creating/modifying `.env`:
```bash
cd client && npm run dev
```

### Issue 3: Database connection error

**Solution**: 
- For SQLite: Should work automatically
- For PostgreSQL: Verify credentials in `.env` match your database
- Run migrations: `npm run migrate` in server directory

### Issue 4: Port already in use (3000 or 5173)

**Solution**: Change the port in `.env` or kill the process using the port:
```powershell
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Next Steps for Your Project

Based on the project description, you need to implement:

### 1. **Department and Level Filtering**
   - Location: `server/src/models/` - Add department/level fields
   - Location: `server/src/routes/tutors.js` - Add filter logic
   - Location: `client/src/components/` - Add filter UI

### 2. **Nigerian University Course Codes**
   - Location: `server/src/config/courses.js` - Define course codes
   - Location: `client/src/services/courseService.js` - Fetch courses

### 3. **UI Changes for Nigerian Context**
   - Update landing page with Nigerian university information
   - Modify registration forms for WAEC/NECO/JAMB course selection

---

## File Structure for Modifications

When implementing new features:

**Backend Path**: `server/src/`
```
routes/        → API endpoint definitions
models/        → Database schemas
controllers/   → Business logic
middleware/    → Auth, validation, etc.
config/        → Configuration
services/      → Reusable business logic
```

**Frontend Path**: `client/src/`
```
pages/         → Full page components
components/    → Reusable UI components
services/      → API call functions
hooks/         → Custom React hooks
utils/         → Helper functions
```

---

## Debugging Tips

### Backend Debugging

1. Check server logs for errors:
   ```bash
   # Logs will show in the terminal running "npm run dev"
   ```

2. Check API responses using browser DevTools:
   - F12 → Network tab
   - Make requests and inspect responses

3. Use VSCode debugger:
   - Set breakpoints in `server/src/` files
   - Attach debugger through launch.json

### Frontend Debugging

1. React DevTools Browser Extension
2. Console logs: `console.log()` in components
3. Network tab for API requests
4. Vite HMR (Hot Module Replacement) for instant updates

---

## Production Deployment

### Server Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

Update `.env` for production:
```env
NODE_ENV=production
JWT_SECRET=<generate-secure-secret>
CLIENT_URL=<your-production-domain>
DB_SSL=true  # For PostgreSQL
```

### Client Deployment
```bash
# Build for production
npm run build

# Deploy the 'dist' folder to your hosting provider
```

Update `.env` for production:
```env
VITE_API_URL=https://your-api-domain.com/api
```

---

## Useful Resources

- **Express.js**: https://expressjs.com/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **Sequelize ORM**: https://sequelize.org/
- **Stream Chat**: https://getstream.io/chat/
- **TailwindCSS**: https://tailwindcss.com/

---

**Last Updated**: April 8, 2026
**Status**: ✅ Ready for development
