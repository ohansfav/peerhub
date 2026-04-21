const ApiError = require("@utils/apiError");
const { where, Op, literal, UniqueConstraintError } = require("sequelize");
const { Subject, User, Tutor, Student, TutorStat } = require("@models");
const sequelize = require("@src/shared/database");
const { required } = require("joi");
const parseDataWithMeta = require("@src/shared/utils/meta");

exports.createTutor = async ({ profile, userId, documentKey }) => {
  console.log("createTutor called with profile:", profile, "userId:", userId);

  // Guard against duplicate insert races by checking first and recovering on unique conflicts.
  let tutor = await Tutor.findOne({ where: { userId } });
  let created = false;

  if (!tutor) {
    try {
      tutor = await Tutor.create({
        ...profile,
        documentKey: documentKey || null,
      });
      created = true;
    } catch (error) {
      if (!(error instanceof UniqueConstraintError)) {
        throw error;
      }

      tutor = await Tutor.findOne({ where: { userId } });
      if (!tutor) {
        throw error;
      }
    }
  }

  if (created) {
    console.log("Creating new tutor profile");
    // New tutor created
    await addSubjectsToProfile({
      profile: tutor,
      subjectIds: profile.subjects,
      requireAtLeastOne: true,
    });

    await User.update(
      { role: "tutor", isOnboarded: true },
      { where: { id: userId } }
    );
  } else {
    console.log("Updating existing tutor profile");
    // Existing tutor found, update it
    await tutor.update({
      ...profile,
      documentKey: documentKey || tutor.documentKey,
    });

    await addSubjectsToProfile({
      profile: tutor,
      subjectIds: profile.subjects,
      requireAtLeastOne: true,
    });

    // Ensure user is properly onboarded and has tutor role
    await User.update(
      { role: "tutor", isOnboarded: true },
      { where: { id: userId } }
    );
  }

  return this.getTutor(userId);
};

exports.getTutor = async (userId) => {
  return Tutor.scope("join")
    .findByPk(userId)
    .then((tutor) => {
      if (!tutor) {
        return null;
      }
      if (tutor.stats.averageRating === null) {
        return { ...tutor.toJSON(), stats: DEFAULT_STATS };
      } else {
        return { ...tutor.toJSON() };
      }
    });
};

exports.getTutors = async ({
  approvalStatus = "approved",
  profileVisibility = "active",
  subjects,
  name,
  ratings,
  limit = 10,
  page = 1,
}) => {
  const includes = [
    {
      model: Subject.scope("join"),
      as: "subjects",
    },
    {
      model: User,
      as: "user",
      required: true, // Only include tutors that have a valid user relationship
    },
  ];

  // SQLite does not support ILIKE; use LIKE for non-Postgres dialects.
  const nameLikeOperator =
    sequelize.getDialect() === "postgres" ? Op.iLike : Op.like;

  //Name
  if (name) {
    const searchWords = name.split(" ");

    const conditions = searchWords.map((word) => ({
      [Op.or]: [
        { first_name: { [nameLikeOperator]: `%${word}%` } },
        { last_name: { [nameLikeOperator]: `%${word}%` } },
      ],
    }));

    const nameInclude = {
      model: User.scope("join"),
      as: "user",
      where: conditions,
    };
    includes.push(nameInclude);
  }

  // await sequelize.query(sql`SELECT * FROM projects WHERE ${sql.where(where)}`);
  if (ratings && ratings.length > 0) {
    const ratingWhere = sequelize.where(
      sequelize.fn("ROUND", sequelize.col("average_rating")),
      {
        [Op.in]: ratings.map(Number),
      }
    );
    includes.push({
      model: TutorStat.scope("join"),
      as: "stats",
      where: ratingWhere,
    });
  }

  const where = {
    approvalStatus,
    profileVisibility,
    ...(subjects &&
      subjects.length > 0 && {
        userId: {
          [Op.in]: sequelize.literal(`(
        SELECT tutor_user_id
        FROM tutor_subjects
        WHERE subject_id IN (${subjects.map(Number).join(",")})
      )`),
        },
      }),
  };

  const tutors = await Tutor.scope("join").findAndCountAll({
    where: where,
    include: includes,
    limit: limit,
    offset: (page - 1) * limit,
    distinct: true,
  });

  const count = tutors.count;

  const tutorWithStats = tutors.rows.map((tutor) => {
    if (tutor.stats.averageRating === null) {
      return { ...tutor.toJSON(), stats: DEFAULT_STATS };
    } else {
      return { ...tutor.toJSON() };
    }
  });

  return {
    count: count,
    rows: tutorWithStats,
  };
};

exports.getTutorRecommendations = async ({ userId, limit = 10, page = 1 }) => {
  const student = await Student.findOne({ where: { userId } });

  const subjects = await student.getSubjects();
  const subjectIds = subjects.map((subject) => subject.id);

  let recommendedTutors = await Tutor.scope("join").findAndCountAll({
    where: {
      approvalStatus: "approved",
      profileVisibility: "active",
    },
    include: [
      {
        model: Subject,
        as: "subjects",
        where: { id: { [Op.in]: subjectIds } },
      },
      {
        model: User,
        as: "user",
        required: true, // Only include tutors that have a valid user relationship
      },
    ],
    limit: limit,
    offset: (page - 1) * limit,
    distinct: true,
  });

  if (recommendedTutors.count === 0) {
    recommendedTutors = await Tutor.scope("join").findAndCountAll({
      where: {
        approvalStatus: "approved",
        profileVisibility: "active",
      },
      include: [
        { model: Subject, as: "subjects" },
        {
          model: User,
          as: "user",
          required: true, // Only include tutors that have a valid user relationship
        },
      ],
      limit: limit,
      offset: (page - 1) * limit,
      distinct: true,
    });
  }
  const count = recommendedTutors.count;

  const tutorWithStats = recommendedTutors.rows.map((tutor) => {
    if (tutor.stats.averageRating === null) {
      return { ...tutor.toJSON(), stats: DEFAULT_STATS };
    } else {
      return { ...tutor.toJSON() };
    }
  });

  return {
    count: count,
    rows: tutorWithStats,
  };
};

const DEFAULT_STATS = {
  totalCompletedSessions: 0,
  totalWeeklySessions: 0,
  totalStudents: 0,
  totalHoursTaught: 0.0,
  averageRating: 0.0,
  totalReviews: 0,
  reviewBreakdown: [
    { stars: 5, percent: 0 },
    { stars: 4, percent: 0 },
    { stars: 3, percent: 0 },
    { stars: 2, percent: 0 },
    { stars: 1, percent: 0 },
  ],
};

exports.updateTutorProfile = async ({ id, tutorProfile }) => {
  const [count] = await Tutor.update(tutorProfile, {
    where: { user_id: id },
  });

  if (count === 0) {
    throw new ApiError(
      "Tutor profile does not exist",
      404,
      "Tutor profile not found"
    );
  }

  const updatedProfile = await Tutor.unscoped().findByPk(id);

  await addSubjectsToProfile({
    profile: updatedProfile,
    subjectIds: tutorProfile.subjects,
  });
  return await this.getTutor(id);
};

async function addSubjectsToProfile({
  profile,
  subjectIds,
  requireAtLeastOne = false,
}) {
  console.log("addSubjectsToProfile called with subjectIds:", subjectIds);

  const validSubjectIds = Array.isArray(subjectIds) 
    ? [...new Set(
        subjectIds
          .filter((id) => id != null && id !== '' && id !== undefined)
          .map(id => Number(id))
          .filter(id => !isNaN(id) && id > 0)
      )]
    : [];

  console.log("validSubjectIds after filtering:", validSubjectIds);

  if (validSubjectIds.length === 0) {
    if (requireAtLeastOne) {
      throw new ApiError(
        "Please select at least one valid course.",
        400,
        "Invalid course selection"
      );
    }

    console.log("No valid subject IDs found, clearing subjects");
    await profile.setSubjects([]);
    return;
  }

  const selectedSubjects = await Subject.findAll({
    where: {
      id: {
        [Op.in]: validSubjectIds,
      },
    },
  });

  console.log("Found subjects:", selectedSubjects.length, "out of", validSubjectIds.length);

  if (selectedSubjects.length !== validSubjectIds.length) {
    throw new ApiError(
      "One or more selected courses are invalid.",
      400,
      "Invalid course selection"
    );
  }

  // Replace existing subjects with the validated selection
  await profile.setSubjects(selectedSubjects);
  console.log("Successfully set subjects for profile");
}
