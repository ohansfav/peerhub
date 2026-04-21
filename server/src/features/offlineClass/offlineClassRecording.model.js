const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OfflineClassRecording = sequelize.define(
    "OfflineClassRecording",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      classId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      tutorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      audioDataUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      durationSeconds: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "offline_class_recordings",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["class_id"] },
        { fields: ["tutor_id"] },
        { fields: ["created_at"] },
      ],
    }
  );

  OfflineClassRecording.associate = (models) => {
    OfflineClassRecording.belongsTo(models.OfflineClass, {
      foreignKey: "classId",
      as: "offlineClass",
    });

    OfflineClassRecording.belongsTo(models.User, {
      foreignKey: "tutorId",
      as: "tutor",
    });
  };

  return OfflineClassRecording;
};
