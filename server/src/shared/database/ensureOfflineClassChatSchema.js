const { DataTypes } = require("sequelize");

async function ensureOfflineClassChatSchema(sequelize, logger) {
  const queryInterface = sequelize.getQueryInterface();

  try {
    const offlineClassTable = await queryInterface.describeTable("offline_classes");

    if (!offlineClassTable.participant_user_ids_json) {
      await queryInterface.addColumn("offline_classes", "participant_user_ids_json", {
        type: DataTypes.TEXT,
        allowNull: true,
      });
      logger.info("Added offline_classes.participant_user_ids_json column");
    }
  } catch (error) {
    logger.info("offline_classes table not yet present, skipping schema patch");
  }

  try {
    const table = await queryInterface.describeTable("offline_class_chat_messages");

    if (!table.audio_data_url) {
      await queryInterface.addColumn("offline_class_chat_messages", "audio_data_url", {
        type: DataTypes.TEXT,
        allowNull: true,
      });
      logger.info("Added offline_class_chat_messages.audio_data_url column");
    }
  } catch (error) {
    // Table may not exist yet; sequelize.sync will create it.
    logger.info("offline_class_chat_messages table not yet present, skipping schema patch");
  }

  try {
    const recordingTable = await queryInterface.describeTable("offline_class_recordings");

    if (!recordingTable.title) {
      await queryInterface.addColumn("offline_class_recordings", "title", {
        type: DataTypes.STRING,
        allowNull: true,
      });
      logger.info("Added offline_class_recordings.title column");
    }
  } catch (error) {
    logger.info("offline_class_recordings table not yet present, skipping schema patch");
  }
}

module.exports = ensureOfflineClassChatSchema;
