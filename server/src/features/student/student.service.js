const ApiError = require("@utils/apiError");
const { User, Student, Subject, Exam } = require("@models");
const { Op } = require("sequelize");
const sequelize = require("@src/shared/database");

const sanitizeIdList = (list) => {
  if (!Array.isArray(list)) return [];
  return [...new Set(list.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))];
};

module.exports = {
  // get all
  async listStudents({ limit = 10, page = 1, search = "" }) {
    const parsedLimit = Number(limit) || 10;
    const parsedPage = Number(page) || 1;
    const trimmedSearch = String(search || "").trim();

    const include = [
      {
        model: User,
        as: "user",
      },
      {
        model: Subject,
        as: "subjects",
        through: { attributes: [] },
      },
      {
        model: Exam,
        as: "exams",
        through: { attributes: [] },
      },
    ];

    if (trimmedSearch) {
      const likeOperator = sequelize.getDialect() === "postgres" ? Op.iLike : Op.like;
      include[0].where = {
        [Op.or]: [
          { firstName: { [likeOperator]: `%${trimmedSearch}%` } },
          { lastName: { [likeOperator]: `%${trimmedSearch}%` } },
          { email: { [likeOperator]: `%${trimmedSearch}%` } },
        ],
      };
      include[0].required = true;
    }

    return await Student.findAndCountAll({
      limit: parsedLimit,
      offset: (parsedPage - 1) * parsedLimit,
      include,
      distinct: true,
      order: [[{ model: User, as: "user" }, "firstName", "ASC"]],
    });
  },
  // get one
  async getStudentById(id) {
    const student = await Student.scope("join").findByPk(id, {});
    if (!student) {
      throw new ApiError("Student does not exist", 404);
    }
    return student;
  },
  // onboarding
  async createStudentForUser(userId, data) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const payload = data || {};
    const subjectIds = sanitizeIdList(payload.subjects);
    const examIds = sanitizeIdList(payload.exams);

    if (subjectIds.length === 0) {
      throw new ApiError("Please select at least one valid subject", 400);
    }

    if (examIds.length === 0) {
      throw new ApiError("Please select at least one valid exam", 400);
    }

    const selectedSubjects = await Subject.findAll({ where: { id: subjectIds } });
    if (selectedSubjects.length !== subjectIds.length) {
      throw new ApiError("One or more selected subjects are invalid", 400);
    }

    const selectedExams = await Exam.findAll({ where: { id: examIds } });
    if (selectedExams.length !== examIds.length) {
      throw new ApiError("One or more selected exams are invalid", 400);
    }

    await sequelize.transaction(async (transaction) => {
      const existing = await Student.findByPk(userId, { transaction });

      if (existing) {
        // Update existing student profile instead of throwing error
        await existing.update(
          {
            gradeLevel: payload.gradeLevel,
            learningGoals: payload.learningGoals,
          },
          { transaction }
        );

        await existing.setSubjects(subjectIds, { transaction });
        await existing.setExams(examIds, { transaction });
      } else {
        const student = await Student.create(
          {
            userId,
            gradeLevel: payload.gradeLevel,
            learningGoals: payload.learningGoals,
          },
          { transaction }
        );

        await student.setSubjects(subjectIds, { transaction });
        await student.setExams(examIds, { transaction });
      }

      // Only mark onboarding complete if all profile + association writes succeeded.
      await user.update({ isOnboarded: true, role: "student" }, { transaction });
    });

    return this.getStudentById(userId);
  },

  // update user
  async updateStudent(id, data) {
    const payload = data || {};
    const student = await Student.findByPk(id);

    if (!student) {
      throw new ApiError("Student not found", 404);
    }

    if (payload.gradeLevel) {
      student.gradeLevel = payload.gradeLevel;
    }
    if (payload.learningGoals) {
      student.learningGoals = payload.learningGoals;
    }

    await student.save();

    if (payload.subjects) {
      await student.setSubjects(payload.subjects);
    }
    if (payload.exams) {
      await student.setExams(payload.exams);
    }

    return this.getStudentById(student.userId || student.id);
  },
};
