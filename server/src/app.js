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
const quizRoutes = require("@features/quiz/quiz.route");
const broadcastRoutes = require("@features/broadcast/broadcast.route");
const offlineClassRoutes = require("@features/offlineClass/offlineClass.route");
const localChatRoutes = require("@features/localChat/localChat.route");
const studentStatsRoutes = require("@features/student/studentStats.route");
const courseRoutes = require("@features/course/course.route");

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
).split(",").map(o => o.trim());

const currentEnv = String(process.env.NODE_ENV || "development").trim().toLowerCase();
const isDevMode = currentEnv !== "production";
const isPrivateLanOrigin = (origin) =>
  /^https?:\/\/(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/i.test(origin);
const isTunnelOrigin = (origin) =>
  /^https?:\/\/([a-z0-9-]+\.)?(trycloudflare\.com|ngrok\.io|ngrok-free\.app|ngrok-free\.dev)(:\d+)?$/i.test(origin);

// Trust first proxy
app.set("trust proxy", 1);

// Middleware
app.use(helmet());
const apiCorsOptions = {
  // Reflect request origin so browser credentialed requests succeed from tunnel URLs.
  origin: true,
  credentials: true,
};

app.use("/api", cors(apiCorsOptions));
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
app.use("/api/quiz", quizRoutes);
app.use("/api/broadcast", broadcastRoutes);
app.use("/api/offline-class", offlineClassRoutes);
app.use("/api/local-chat", localChatRoutes);
app.use("/api/student-stats", studentStatsRoutes);
app.use("/api/course", courseRoutes);

app.use("/api/chat", chatRoutes);

// Serve locally uploaded files in development
const { LOCAL_UPLOAD_DIR } = require("@src/shared/S3/s3Service");
app.use("/api/uploads", express.static(LOCAL_UPLOAD_DIR));

app.get("/api/health", (req, res) => {
  sendResponse(res, 200, "Server is healthy", {
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Serve index.html for all non-API routes (SPA fallback)
app.use((req, res, next) => {
  // Skip if it's an API route
  if (req.path.startsWith("/api")) {
    return next();
  }
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
