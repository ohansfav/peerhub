const express = require("express");
const { protectRoute, requireVerifiedAndOnboardedUser } = require("@features/auth/auth.middleware");
const { Booking, QuizAttempt } = require("@models");
const sendResponse = require("@utils/sendResponse");
const { Op } = require("sequelize");
const sequelize = require("@src/shared/database/index");

const router = express.Router();

router.use(protectRoute);
router.use(requireVerifiedAndOnboardedUser);

// GET /api/student-stats - Get student dashboard stats
router.get("/", async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return sendResponse(res, 200, "Stats", { streak: 0, quizzesTaken: 0, averageScore: 0 });
    }

    const studentId = req.user.id;

    // 1. Calculate daily streak from completed bookings and quiz attempts
    const streak = await calculateStreak(studentId);

    // 2. Count quizzes taken
    const quizzesTaken = await QuizAttempt.count({
      where: { studentId },
    });

    // 3. Calculate average score
    const scoreResult = await QuizAttempt.findOne({
      where: { studentId },
      attributes: [
        [sequelize.fn("AVG", sequelize.literal("CAST(score AS FLOAT) / CAST(total_questions AS FLOAT) * 100")), "avgScore"],
      ],
      raw: true,
    });

    const averageScore = scoreResult?.avgScore ? Math.round(Number(scoreResult.avgScore)) : 0;

    sendResponse(res, 200, "Student stats fetched", {
      streak,
      quizzesTaken,
      averageScore,
    });
  } catch (error) {
    next(error);
  }
});

async function calculateStreak(studentId) {
  // Get all dates where user had activity (completed sessions or quiz attempts)
  const completedBookings = await Booking.findAll({
    where: {
      studentId,
      status: "completed",
    },
    attributes: ["scheduledStart"],
    raw: true,
  });

  const quizAttempts = await QuizAttempt.findAll({
    where: { studentId },
    attributes: ["completedAt"],
    raw: true,
  });

  // Collect unique activity dates
  const activityDates = new Set();

  completedBookings.forEach((b) => {
    if (b.scheduledStart) {
      activityDates.add(new Date(b.scheduledStart).toISOString().split("T")[0]);
    }
  });

  quizAttempts.forEach((a) => {
    if (a.completedAt) {
      activityDates.add(new Date(a.completedAt).toISOString().split("T")[0]);
    } else if (a.completed_at) {
      activityDates.add(new Date(a.completed_at).toISOString().split("T")[0]);
    }
  });

  if (activityDates.size === 0) return 0;

  // Sort dates descending
  const sortedDates = [...activityDates].sort((a, b) => new Date(b) - new Date(a));

  // Check if the most recent activity was today or yesterday
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0; // Streak broken
  }

  // Count consecutive days
  let streak = 1;
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = new Date(sortedDates[i]);
    const next = new Date(sortedDates[i + 1]);
    const diffDays = (current - next) / 86400000;

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

module.exports = router;
