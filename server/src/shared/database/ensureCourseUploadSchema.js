const { DataTypes } = require("sequelize");

async function ensureCourseUploadSchema(sequelize, logger) {
  const queryInterface = sequelize.getQueryInterface();
  const tableName = "courses";

  const table = await queryInterface.describeTable(tableName);

  if (!table.tutor_user_id) {
    await queryInterface.addColumn(tableName, "tutor_user_id", {
      type: DataTypes.UUID,
      allowNull: true,
    });
    logger.info("Added courses.tutor_user_id column for tutor uploads");
  }

  if (!table.material_key) {
    await queryInterface.addColumn(tableName, "material_key", {
      type: DataTypes.STRING,
      allowNull: true,
    });
    logger.info("Added courses.material_key column for course materials");
  }

  if (!table.material_name) {
    await queryInterface.addColumn(tableName, "material_name", {
      type: DataTypes.STRING,
      allowNull: true,
    });
    logger.info("Added courses.material_name column for course material names");
  }
}

module.exports = ensureCourseUploadSchema;
