const express = require("express");
const router = express.Router();
const validate = require("@src/shared/middlewares/validate.middleware");
const courseValidator = require("./course.validator");
const courseController = require("./course.controller");
const authMiddleware = require("@features/auth/auth.middleware");

router.use(authMiddleware.protectRoute);
router.use(authMiddleware.requireVerifiedAndOnboardedUser);

// List all available courses (any authenticated user)
router.get(
  "/",
  validate(courseValidator.listCoursesQuery, "query"),
  courseController.listCourses
);

// Student-only routes
router.get(
  "/my-courses",
  authMiddleware.requireStudentRole,
  courseController.getMyCoursesHandler
);

router.get(
  "/:id",
  validate(courseValidator.courseIdParam, "params"),
  courseController.getCourse
);

router.post(
  "/:id/register",
  authMiddleware.requireStudentRole,
  validate(courseValidator.courseIdParam, "params"),
  courseController.registerCourse
);

router.delete(
  "/:id/register",
  authMiddleware.requireStudentRole,
  validate(courseValidator.courseIdParam, "params"),
  courseController.unregisterCourse
);

module.exports = router;
