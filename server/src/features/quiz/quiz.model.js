const sequelize = require("@src/shared/database/index");
const { DataTypes } = require("sequelize");

module.exports = () => {
  const Quiz = sequelize.define(
    "Quiz",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tutorId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "tutor_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      subjectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "subject_id",
        references: {
          model: "subjects",
          key: "id",
        },
      },
      questions: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
          const raw = this.getDataValue("questions");
          return raw ? JSON.parse(raw) : [];
        },
        set(val) {
          this.setDataValue("questions", JSON.stringify(val));
        },
      },
      timeLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "time_limit",
        comment: "Time limit in minutes",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        field: "is_active",
        defaultValue: true,
      },
    },
    {
      tableName: "quizzes",
      underscored: true,
      timestamps: true,
    }
  );

  const QuizAttempt = sequelize.define(
    "QuizAttempt",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      quizId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "quiz_id",
        references: {
          model: "quizzes",
          key: "id",
        },
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "student_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "total_questions",
      },
      answers: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const raw = this.getDataValue("answers");
          return raw ? JSON.parse(raw) : [];
        },
        set(val) {
          this.setDataValue("answers", JSON.stringify(val));
        },
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "completed_at",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "quiz_attempts",
      underscored: true,
      timestamps: true,
    }
  );

  Quiz.associate = (models) => {
    Quiz.belongsTo(models.User, {
      foreignKey: "tutorId",
      as: "tutor",
    });
    Quiz.belongsTo(models.Subject, {
      foreignKey: "subjectId",
      as: "subject",
    });
    Quiz.hasMany(models.QuizAttempt, {
      foreignKey: "quizId",
      as: "attempts",
    });
  };

  QuizAttempt.associate = (models) => {
    QuizAttempt.belongsTo(models.Quiz, {
      foreignKey: "quizId",
      as: "quiz",
    });
    QuizAttempt.belongsTo(models.User, {
      foreignKey: "studentId",
      as: "student",
    });
  };
};
