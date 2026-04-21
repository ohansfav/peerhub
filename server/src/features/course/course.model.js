const sequelize = require("@src/shared/database/index");
const { DataTypes } = require("sequelize");

module.exports = () => {
  const Course = sequelize.define(
    "Course",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      courseCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      creditUnits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      level: {
        type: DataTypes.ENUM("100", "200", "300", "400"),
        allowNull: false,
      },
      semester: {
        type: DataTypes.ENUM("first", "second"),
        allowNull: false,
      },
      tutorUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      materialKey: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      materialName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "courses",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["course_code"] },
        { fields: ["level"] },
        { fields: ["semester"] },
        { fields: ["tutor_user_id"] },
      ],
    }
  );

  Course.associate = (models) => {
    Course.belongsToMany(models.Student, {
      through: "student_courses",
      as: "students",
      foreignKey: "courseId",
      otherKey: "studentId",
    });

    Course.belongsTo(models.User, {
      foreignKey: "tutorUserId",
      as: "tutorUploader",
    });
  };

  return Course;
};
