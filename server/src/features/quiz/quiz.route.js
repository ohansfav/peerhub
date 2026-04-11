const express = require("express");
const { protectRoute, requireVerifiedAndOnboardedUser } = require("@features/auth/auth.middleware");
const { Quiz, QuizAttempt, User, Subject } = require("@models");
const sendResponse = require("@utils/sendResponse");
const ApiError = require("@utils/apiError");
const { Op } = require("sequelize");

const router = express.Router();

router.use(protectRoute);
router.use(requireVerifiedAndOnboardedUser);

// GET /api/quiz - Get all active quizzes (for students) or own quizzes (for tutors)
router.get("/", async (req, res, next) => {
  try {
    const isTutor = req.user.role === "tutor";

    const where = isTutor
      ? { tutorId: req.user.id }
      : { isActive: true };

    const quizzes = await Quiz.findAll({
      where,
      include: [
        {
          model: User,
          as: "tutor",
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Subject,
          as: "subject",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // For students, also include their attempt info
    if (!isTutor) {
      const quizIds = quizzes.map((q) => q.id);
      const attempts = await QuizAttempt.findAll({
        where: {
          studentId: req.user.id,
          quizId: { [Op.in]: quizIds },
        },
      });

      const attemptMap = {};
      attempts.forEach((a) => {
        if (!attemptMap[a.quizId]) attemptMap[a.quizId] = [];
        attemptMap[a.quizId].push(a);
      });

      const quizzesWithAttempts = quizzes.map((q) => ({
        ...q.toJSON(),
        myAttempts: attemptMap[q.id] || [],
        attempted: !!attemptMap[q.id],
      }));

      return sendResponse(res, 200, "Quizzes fetched", quizzesWithAttempts);
    }

    sendResponse(res, 200, "Quizzes fetched", quizzes);
  } catch (error) {
    next(error);
  }
});

// POST /api/quiz - Create a quiz (tutor only)
router.post("/", async (req, res, next) => {
  try {
    if (req.user.role !== "tutor") {
      throw new ApiError("Only tutors can create quizzes", 403);
    }

    const { title, description, subjectId, questions, timeLimit } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      throw new ApiError("Title and at least one question are required", 400);
    }

    // Validate question format
    for (const q of questions) {
      if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length < 2) {
        throw new ApiError("Each question must have text and at least 2 options", 400);
      }
      if (q.correctAnswer === undefined || q.correctAnswer === null) {
        throw new ApiError("Each question must have a correctAnswer index", 400);
      }
    }

    const quiz = await Quiz.create({
      title,
      description,
      tutorId: req.user.id,
      subjectId: subjectId || null,
      questions,
      timeLimit: timeLimit || null,
    });

    sendResponse(res, 201, "Quiz created successfully", quiz);
  } catch (error) {
    next(error);
  }
});

// GET /api/quiz/:id - Get a specific quiz
router.get("/:id", async (req, res, next) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "tutor",
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Subject,
          as: "subject",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!quiz) throw new ApiError("Quiz not found", 404);

    sendResponse(res, 200, "Quiz fetched", quiz);
  } catch (error) {
    next(error);
  }
});

// POST /api/quiz/:id/submit - Submit quiz answers (student only)
router.post("/:id/submit", async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      throw new ApiError("Only students can submit quiz answers", 403);
    }

    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) throw new ApiError("Quiz not found", 404);
    if (!quiz.isActive) throw new ApiError("This quiz is no longer active", 400);

    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      throw new ApiError("Answers array is required", 400);
    }

    const questions = quiz.questions;
    let score = 0;

    const gradedAnswers = questions.map((q, index) => {
      const studentAnswer = answers[index];
      const isCorrect = studentAnswer === q.correctAnswer;
      if (isCorrect) score++;
      return {
        questionIndex: index,
        studentAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });

    const attempt = await QuizAttempt.create({
      quizId: quiz.id,
      studentId: req.user.id,
      score,
      totalQuestions: questions.length,
      answers: gradedAnswers,
      completedAt: new Date(),
    });

    sendResponse(res, 201, "Quiz submitted successfully", {
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      answers: gradedAnswers,
      attemptId: attempt.id,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/quiz/:id - Delete a quiz (tutor who owns it)
router.delete("/:id", async (req, res, next) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) throw new ApiError("Quiz not found", 404);
    if (quiz.tutorId !== req.user.id) {
      throw new ApiError("You can only delete your own quizzes", 403);
    }

    await quiz.destroy();
    sendResponse(res, 200, "Quiz deleted");
  } catch (error) {
    next(error);
  }
});

// PUT /api/quiz/:id - Update a quiz (tutor who owns it)
router.put("/:id", async (req, res, next) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) throw new ApiError("Quiz not found", 404);
    if (quiz.tutorId !== req.user.id) {
      throw new ApiError("You can only edit your own quizzes", 403);
    }

    const { title, description, subjectId, questions, timeLimit, isActive } = req.body;
    await quiz.update({
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(subjectId !== undefined && { subjectId }),
      ...(questions && { questions }),
      ...(timeLimit !== undefined && { timeLimit }),
      ...(isActive !== undefined && { isActive }),
    });

    sendResponse(res, 200, "Quiz updated", quiz);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
