const express = require("express");
const router = express.Router();
const validate = require("@src/shared/middlewares/validate.middleware");
const courseValidator = require("./course.validator");
const courseController = require("./course.controller");
const authMiddleware = require("@features/auth/auth.middleware");
const { uploadSingleS3 } = require("@src/shared/middlewares/upload.middleware");

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

// Tutor-only routes
router.get(
  "/tutor/my-courses",
  authMiddleware.requireTutorRole,
  courseController.getTutorUploadedCoursesHandler
);

router.post(
  "/tutor/upload",
  authMiddleware.requireTutorRole,
  uploadSingleS3,
  validate(courseValidator.tutorCourseUploadBody, "body"),
  courseController.uploadTutorCourse
);

router.delete(
  "/tutor/:id",
  authMiddleware.requireTutorRole,
  validate(courseValidator.courseIdParam, "params"),
  courseController.deleteTutorUploadedCourse
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
