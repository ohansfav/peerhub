const sendResponse = require("@utils/sendResponse");
const courseService = require("./course.service");
const { uploadFileToS3 } = require("@src/shared/S3/s3Service");

module.exports = {
  // GET /api/course - List all courses
  async listCourses(req, res, next) {
    try {
      const { level, semester, search, page, limit } = req.query;
      const result = await courseService.listCourses({
        level,
        semester,
        search,
        page,
        limit,
      });
      sendResponse(res, 200, "Courses fetched", result);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/course/:id - Get single course
  async getCourse(req, res, next) {
    try {
      const course = await courseService.getCourseById(req.params.id);
      sendResponse(res, 200, "Course fetched", course);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/course/my-courses - Get student's registered courses
  async getMyCoursesHandler(req, res, next) {
    try {
      const courses = await courseService.getStudentCourses(req.user.id);
      sendResponse(res, 200, "Registered courses fetched", courses);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/course/:id/register - Register for a course
  async registerCourse(req, res, next) {
    try {
      const course = await courseService.registerCourse(
        req.user.id,
        req.params.id
      );
      sendResponse(res, 201, "Course registered successfully", course);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/course/:id/register - Drop a course
  async unregisterCourse(req, res, next) {
    try {
      const result = await courseService.unregisterCourse(
        req.user.id,
        req.params.id
      );
      sendResponse(res, 200, "Course dropped successfully", result);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/course/tutor/my-courses
  async getTutorUploadedCoursesHandler(req, res, next) {
    try {
      const courses = await courseService.getTutorUploadedCourses(req.user.id);
      sendResponse(res, 200, "Tutor uploaded courses fetched", courses);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/course/tutor/upload
  async uploadTutorCourse(req, res, next) {
    try {
      const payload = {
        ...req.body,
        creditUnits:
          req.body.creditUnits !== undefined
            ? Number(req.body.creditUnits)
            : undefined,
        isActive:
          req.body.isActive !== undefined
            ? String(req.body.isActive).toLowerCase() === "true"
            : undefined,
      };

      let materialKey = null;
      let materialName = null;

      if (req.file) {
        const folder =
          process.env.NODE_ENV === "development"
            ? "courses/dev-materials"
            : "courses/materials";
        const upload = await uploadFileToS3(req.file, folder);
        materialKey = upload.key;
        materialName = req.file.originalname;
      }

      const course = await courseService.uploadTutorCourse({
        userId: req.user.id,
        courseData: payload,
        materialKey,
        materialName,
      });

      sendResponse(res, 201, "Course uploaded successfully", course);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/course/tutor/:id
  async deleteTutorUploadedCourse(req, res, next) {
    try {
      const result = await courseService.deleteTutorUploadedCourse(
        req.user.id,
        req.params.id
      );
      sendResponse(res, 200, "Course deleted successfully", result);
    } catch (err) {
      next(err);
    }
  },
};
