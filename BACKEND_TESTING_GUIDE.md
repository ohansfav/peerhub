# Backend API Testing Guide

## ✅ Backend is Running

**Server URL**: `http://localhost:3000/api`

---

## 🧪 Quick Test Endpoints

### Health Check
```bash
curl http://localhost:3000/api
```

### Expected Response
- Should return JSON or status information
- Confirms backend is responsive

---

## 📋 Available API Routes

All routes are prefixed with `/api`

### Authentication Routes (if implemented)
```
POST   /auth/register       - Register new user
POST   /auth/login          - Login user
POST   /auth/logout         - Logout user
POST   /auth/refresh        - Refresh JWT token
POST   /auth/forgot-password - Request password reset
```

### User Routes
```
GET    /students            - List all students
GET    /tutors              - List all tutors
GET    /tutors/:id          - Get tutor profile
GET    /profile             - Get current user profile
PUT    /profile             - Update profile
```

### Session Routes
```
GET    /sessions            - List sessions
POST   /sessions            - Create session
GET    /sessions/:id        - Get session details
PUT    /sessions/:id        - Update session
DELETE /sessions/:id        - Cancel session
```

### Message Routes
```
GET    /messages            - Get messages
POST   /messages            - Send message
```

---

## 🔍 Using Postman/Insomnia

### Steps:
1. Open Postman or Insomnia
2. Create new request
3. Set method to **GET**
4. Enter URL: `http://localhost:3000/api`
5. Click **Send**

### Expected Result:
- Status: 200 or 404 (both indicate server is responding)
- Body: JSON or status message

---

## 💻 Command Line Testing

### Using cURL
```bash
# Simple test
curl http://localhost:3000/api

# Get student list (if endpoint exists)
curl http://localhost:3000/api/students

# With verbose output
curl -v http://localhost:3000/api

# POST request example (registration)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Using PowerShell
```powershell
# Invoke-WebRequest (PowerShell equivalent)
Invoke-WebRequest -Uri "http://localhost:3000/api"

# With body
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

---

## 🗄️ Database Access

### SQLite Database
- **Location**: `server/database.sqlite`
- **Type**: SQLite 3
- **Created**: Automatically on server start
- **Tables**: Auto-synced from models

### View Database
```bash
# Using sqlite3 CLI
sqlite3 server/database.sqlite

# List tables
.tables

# View schema
.schema

# Run query
SELECT * FROM Students;
```

### Or use GUI Tools
- SQLite Browser (free)
- VS Code SQLite Extension
- DBeaver

---

## 📊 Example API Flows

### User Registration Flow
```
1. POST /api/auth/register
   Body: { email, password, name, role }
   
2. Response: { token, user }
   
3. Save token for future requests
```

### Making Authenticated Requests
```
1. Get token from login/register response

2. Add header to all requests:
   Authorization: Bearer {token}

3. Make request:
   GET /api/profile
   Headers: { Authorization: Bearer xyz123 }
```

### Creating a Session
```
1. POST /api/sessions
   Body: {
     tutorId: "xxx",
     studentId: "yyy",
     startTime: "2026-04-10T14:00:00",
     endTime: "2026-04-10T15:00:00"
   }
```

---

## ✨ Features Already Ready

- ✅ Database is synced
- ✅ Models are loaded
- ✅ Routes are registered
- ✅ Middleware is configured
- ✅ Error handling is active
- ✅ Logging is operational

---

## 🐛 Troubleshooting

### Server Not Responding
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F

# Restart server
cd server && npm run dev
```

### Connection Refused
- Ensure server is running (check terminal)
- Verify firewall isn't blocking port 3000
- Check .env PORT setting

### Database Errors
- Database is auto-created on first run
- Check server logs for SQL errors
- Try deleting database.sqlite and restarting

---

## 📝 Notes

- All responses should be JSON format
- Timestamps in ISO 8601 format
- IDs are UUIDs
- Errors include status codes and messages

---

**Backend Ready for Testing** ✅  
**Start Date**: April 8, 2026
