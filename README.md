# 🎓 Peerup - Full Stack Tutoring Platform

> A peer-powered ed-tech platform connecting university students with verified tutors for personalized, live one-on-one tutoring sessions.

## 📋 Project Status

✅ **Setup Complete** - Ready for development!

```
✓ Server (Backend) - Dependencies installed
✓ Client (Frontend) - Dependencies installed  
✓ Environment files - Configured
✓ Integration guides - Created
✓ Documentation - Complete
```

---

## 🚀 Quick Start

### Option 1: Automated Start (Windows)

**Using Batch Script:**
```bash
START.bat
```

**Using PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File START.ps1
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Access the Application

- 🌐 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:3000/api
- 📚 API Documentation: http://localhost:3000/api/docs (if available)

---

## 📁 Project Structure

```
Peerup/
├── server/                          # Backend (Node.js/Express)
│   ├── src/
│   │   ├── server.js               # Entry point
│   │   ├── routes/                 # API endpoints
│   │   ├── models/                 # Database models
│   │   ├── controllers/            # Business logic
│   │   ├── middleware/             # Auth, validation
│   │   └── config/                 # Configuration
│   ├── .env                        # Environment variables (created)
│   ├── package.json
│   └── README.md
│
├── client/                          # Frontend (React/Vite)
│   ├── src/
│   │   ├── main.jsx                # Entry point
│   │   ├── pages/                  # Page components
│   │   ├── components/             # Reusable components
│   │   ├── services/               # API services
│   │   └── assets/                 # Images, styles
│   ├── .env                        # Environment variables (created)
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
│
├── .sixth/                         # Previous project files (ignore)
│
├── INTEGRATION_GUIDE.md            # How frontend and backend work together
├── NIGERIA_IMPLEMENTATION.md       # Nigeria-specific feature implementation
├── START.bat                       # Quick start script (Windows Batch)
├── START.ps1                       # Quick start script (PowerShell)
└── README.md                       # This file
```

---

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: PostgreSQL / SQLite (development)
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Chat**: Stream Chat
- **Email**: Mailtrap

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS + DaisyUI
- **State Management**: React Query
- **HTTP Client**: Axios
- **Real-time Chat**: Stream Chat React SDK
- **Routing**: React Router v7

---

## 📚 Documentation

### For Setup and Integration
📄 **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)**
- Comprehensive setup instructions
- Architecture overview
- How frontend and backend communicate
- Common issues and solutions
- Production deployment guide

### For Nigeria Implementation
📄 **[NIGERIA_IMPLEMENTATION.md](./NIGERIA_IMPLEMENTATION.md)**
- Database schema for departments and levels
- API route implementation
- Frontend component examples
- Nigerian university course codes
- Step-by-step development workflow

### Individual Project README
- Backend: [server/README.md](./server/README.md)
- Frontend: [client/README.md](./client/README.md)

---

## 🎯 Your Next Task

Now that the project is set up and running, implement the Nigerian university-specific features:

### Phase 1: Database & API (Backend)
1. Create Department model (`server/src/models/Department.js`)
2. Create Level model (`server/src/models/Level.js`)
3. Add relationships in Tutor model
4. Create migrations
5. Add filter routes (`/api/departments`, `/api/levels`, `/api/tutors/search`)

### Phase 2: Frontend Components
1. Create TutorFilters component
2. Update registration forms with Nigerian fields
3. Add filter service layer
4. Integrate filters into tutor search page

### Phase 3: Testing & Refinement
1. Test API endpoints
2. Test frontend filters
3. Seed sample data
4. UI/UX improvements

📋 Detailed instructions are in [NIGERIA_IMPLEMENTATION.md](./NIGERIA_IMPLEMENTATION.md)

---

## 💾 Environment Configuration

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
DB_DIALECT=sqlite  # or postgres
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_STREAM_API_KEY=your_stream_key
```

For production, update these values accordingly.

---

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test                 # Run Jest tests
npm run lint            # Check for linting errors
npm run lint:fix        # Fix linting errors
```

### Frontend Testing
```bash
cd client
npm run lint            # Check for linting errors
npm run build           # Build for production
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to localhost:3000"
**Solution**: Make sure backend is running: `cd server && npm run dev`

### Issue: Port already in use
**Solution**: Change port in `.env` or kill the process using the port

### Issue: Frontend shows blank page
**Solution**: 
- Check browser console for errors
- Verify API URL in `.env` is correct
- Check if backend is running

### Issue: Database connection error
**Solution**:
- For SQLite: Should work automatically
- For PostgreSQL: Verify credentials in `.env`
- Run migrations: `npm run migrate`

---

## 📞 API Endpoints (Reference)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/students` - List all students
- `GET /api/tutors` - List all tutors
- `GET /api/tutors/:id` - Get tutor details
- `PUT /api/profile` - Update user profile

### Tutoring Sessions
- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Cancel session

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message

---

## 🔒 Security Notes

- Never commit `.env` files with real secrets
- Use strong JWT_SECRET in production
- Enable HTTPS in production
- Validate all user inputs on backend
- Use CORS carefully (currently allows localhost:5173)

---

## 📦 Package Installation

If you need to add new packages:

**Backend:**
```bash
cd server
npm install package-name
```

**Frontend:**
```bash
cd client
npm install package-name
```

---

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Sequelize ORM](https://sequelize.org/)
- [React Query](https://tanstack.com/query/latest)
- [TailwindCSS](https://tailwindcss.com/)

---

## 📞 Support

For issues or questions:
1. Check the relevant guide (INTEGRATION_GUIDE.md or NIGERIA_IMPLEMENTATION.md)
2. Review backend logs in terminal
3. Check browser DevTools (F12) for frontend errors
4. Check the individual project README files

---

## ✨ Features Overview

### Current
- ✅ User Registration (Student & Tutor)
- ✅ User Authentication (JWT)
- ✅ Profile Management
- ✅ Session Scheduling
- ✅ Real-time Messaging (Stream Chat)
- ✅ Availability Management

### To Implement (Your Project)
- 🟡 Department/Level Filtering
- 🟡 Nigerian University Course Codes
- 🟡 Exam Preparation (WAEC/NECO/JAMB)
- 🟡 Payment Integration
- 🟡 Video Session Recording

---

## 📝 Notes

- Both applications run in development mode with hot-reloading
- SQLite database is created automatically on first run
- API documentation can be generated with Swagger/OpenAPI
- Consider adding testing frameworks (Jest, Cypress) for production

---

**Last Updated**: April 8, 2026  
**Status**: ✅ Ready for Development  
**Next Command Approved**: Ready to proceed with your next task!

---

Made with ❤️ for Nigerian students

