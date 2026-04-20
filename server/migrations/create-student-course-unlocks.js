"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("student_course_unlocks", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      studentId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      courseId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      unlockedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      paymentRef: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
    await queryInterface.addIndex("student_course_unlocks", ["studentId"]);
    await queryInterface.addIndex("student_course_unlocks", ["courseId"]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("student_course_unlocks");
  },
};
