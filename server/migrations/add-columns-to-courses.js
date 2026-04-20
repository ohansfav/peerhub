"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("courses", "pdfPath", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("courses", "price", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn("courses", "lockType", {
      type: Sequelize.ENUM("free", "paid"),
      allowNull: false,
      defaultValue: "free",
    });
    await queryInterface.addColumn("courses", "pdfText", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("courses", "pdfPath");
    await queryInterface.removeColumn("courses", "price");
    await queryInterface.removeColumn("courses", "lockType");
    await queryInterface.removeColumn("courses", "pdfText");
  },
};
