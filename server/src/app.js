const express = require("express");
const path = require("path");
const fs = require("fs");
const httpLogger = require("@src/shared/middlewares/httpLogger.middleware");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const studentRoutes = require("@features/student/student.route");
const errorHandler = require("@src/shared/middlewares/error.middleware");
const authRoutes = require("@features/auth/auth.route");
const userRoutes = require("@features/user/user.route");
const tutorRoutes = require("@features/tutor/tutor.route");
const adminRoutes = require("@features/admin/admin.route");
const subjectRoutes = require("@features/subject/subject.route");
const bookingRoutes = require("@features/booking/booking.route");
const examRoutes = require("@features/exams/exams.route");
const eventsRoutes = require("@features/events/events.route");
const chatRoutes = require("@features/chat/chat.route");
const ApiError = require("@utils/apiError");
const sendResponse = require("@utils/sendResponse");
const reviewRoutes = require("@features/reviews/review.route");

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
).split(",");

// Trust first proxy
app.set("trust proxy", 1);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(httpLogger);

// Serve static files from built client (for production/Replit)
const clientDistPath = path.join(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api/chat", chatRoutes);

app.get("/api/health", (req, res) => {
  sendResponse(res, 200, "Server is healthy", {
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Serve index.html for all non-API routes (SPA fallback)
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "../../client/dist/index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: "Frontend not built. Run: npm run build" });
  }
});

// Error handling
app.use(errorHandler);

module.exports = app;
