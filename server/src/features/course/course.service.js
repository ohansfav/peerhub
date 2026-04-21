const ApiError = require("@utils/apiError");
const { Course, Student, Tutor } = require("@models");
const sequelize = require("@src/shared/database/index");
const { getSignedFileUrl } = require("@src/shared/S3/s3Service");
const { Op } = require("sequelize");

const COURSE_ALLOWED_FIELDS = [
  "courseCode",
  "title",
  "description",
  "creditUnits",
  "level",
  "semester",
  "isActive",
];

async function mapCourseWithMaterialUrl(course) {
  const json = course?.toJSON ? course.toJSON() : course;
  if (!json) return null;

  if (!json.materialKey) {
    return json;
  }

  return {
    ...json,
    materialUrl: await getSignedFileUrl(json.materialKey),
  };
}

async function ensureApprovedTutor(userId) {
  const tutorProfile = await Tutor.unscoped().findByPk(userId);

  if (!tutorProfile) {
    throw new ApiError("Tutor profile not found", 404);
  }

  if (tutorProfile.approvalStatus !== "approved") {
    throw new ApiError("Only approved tutors can upload courses", 403);
  }

  return tutorProfile;
}

module.exports = {
  // Get all available courses with optional filters
  async listCourses({ level, semester, search, page = 1, limit = 20 }) {
    const where = { isActive: true };

    if (level) where.level = level;
    if (semester) where.semester = semester;
    if (search) {
      const likeOperator =
        sequelize.getDialect() === "postgres" ? Op.iLike : Op.like;
      where[Op.or] = [
        { courseCode: { [likeOperator]: `%${search}%` } },
        { title: { [likeOperator]: `%${search}%` } },
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

    const mappedRows = await Promise.all(rows.map(mapCourseWithMaterialUrl));

    return {
      data: mappedRows,
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
    return await mapCourseWithMaterialUrl(course);
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

    return await Promise.all(courses.map(mapCourseWithMaterialUrl));
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
    return await mapCourseWithMaterialUrl(course);
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

  async getTutorUploadedCourses(userId) {
    await ensureApprovedTutor(userId);

    const courses = await Course.findAll({
      where: { tutorUserId: userId },
      order: [
        ["createdAt", "DESC"],
        ["courseCode", "ASC"],
      ],
    });

    return await Promise.all(courses.map(mapCourseWithMaterialUrl));
  },

  async uploadTutorCourse({ userId, courseData, materialKey, materialName }) {
    await ensureApprovedTutor(userId);

    const existing = await Course.findOne({
      where: { courseCode: courseData.courseCode },
    });

    if (existing) {
      throw new ApiError("Course with this code already exists", 409);
    }

    const payload = { tutorUserId: userId };

    for (const field of COURSE_ALLOWED_FIELDS) {
      if (courseData[field] !== undefined) {
        payload[field] = courseData[field];
      }
    }

    if (materialKey) {
      payload.materialKey = materialKey;
      payload.materialName = materialName || null;
    }

    const created = await Course.create(payload);
    return await mapCourseWithMaterialUrl(created);
  },

  async deleteTutorUploadedCourse(userId, courseId) {
    await ensureApprovedTutor(userId);

    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new ApiError("Course not found", 404);
    }

    if (course.tutorUserId !== userId) {
      throw new ApiError("You can only delete courses you uploaded", 403);
    }

    await course.destroy();
    return { message: "Course deleted successfully" };
  },
};
