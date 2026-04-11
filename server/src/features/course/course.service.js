const ApiError = require("@utils/apiError");
const { Course, Student } = require("@models");
const { Op } = require("sequelize");

module.exports = {
  // Get all available courses with optional filters
  async listCourses({ level, semester, search, page = 1, limit = 20 }) {
    const where = { isActive: true };

    if (level) where.level = level;
    if (semester) where.semester = semester;
    if (search) {
      where[Op.or] = [
        { courseCode: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Course.findAndCountAll({
      where,
      order: [
        ["level", "ASC"],
        ["courseCode", "ASC"],
      ],
      limit,
      offset: (page - 1) * limit,
    });

    return {
      data: rows,
      meta: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  // Get a single course by ID
  async getCourseById(id) {
    const course = await Course.findByPk(id);
    if (!course) {
      throw new ApiError("Course not found", 404);
    }
    return course;
  },

  // Get courses registered by a student
  async getStudentCourses(studentId) {
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new ApiError("Student not found", 404);
    }

    const courses = await student.getCourses({
      where: { isActive: true },
      order: [
        ["level", "ASC"],
        ["courseCode", "ASC"],
      ],
      joinTableAttributes: ["createdAt"],
    });

    return courses;
  },

  // Register a student for a course
  async registerCourse(studentId, courseId) {
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new ApiError("Student not found", 404);
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new ApiError("Course not found", 404);
    }

    if (!course.isActive) {
      throw new ApiError("This course is not currently available", 400);
    }

    const existing = await student.hasCourse(course);
    if (existing) {
      throw new ApiError("You are already registered for this course", 409);
    }

    await student.addCourse(course);
    return course;
  },

  // Unregister a student from a course
  async unregisterCourse(studentId, courseId) {
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new ApiError("Student not found", 404);
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new ApiError("Course not found", 404);
    }

    const existing = await student.hasCourse(course);
    if (!existing) {
      throw new ApiError("You are not registered for this course", 400);
    }

    await student.removeCourse(course);
    return { message: "Course dropped successfully" };
  },
};
