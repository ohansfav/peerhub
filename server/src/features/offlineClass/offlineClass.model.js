const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OfflineClass = sequelize.define(
    "OfflineClass",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      tutorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      tutorName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      frameDataUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      lastFrameAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      participantFrameDataUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      participantLastFrameAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      participantUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      participantUserIdsJson: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      participantName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "offline_classes",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["is_active"] },
        { fields: ["started_at"] },
        { fields: ["tutor_id"] },
      ],
    }
  );

  OfflineClass.associate = (models) => {
    OfflineClass.belongsTo(models.User, {
      foreignKey: "tutorId",
      as: "tutor",
    });

    OfflineClass.belongsTo(models.User, {
      foreignKey: "participantUserId",
      as: "participant",
    });
  };

  return OfflineClass;
};
