const sendResponse = require("@utils/sendResponse");
const courseService = require("./course.service");

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
};
