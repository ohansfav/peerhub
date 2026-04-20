"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("courses", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      courseCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      creditUnits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      level: {
        type: Sequelize.ENUM("100", "200", "300", "400"),
        allowNull: false,
      },
      semester: {
        type: Sequelize.ENUM("first", "second"),
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("courses", ["courseCode"]);
    await queryInterface.addIndex("courses", ["level"]);
    await queryInterface.addIndex("courses", ["semester"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("courses");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_courses_level";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_courses_semester";');
  },
};
