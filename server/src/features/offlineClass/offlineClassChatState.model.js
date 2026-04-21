const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OfflineClassChatState = sequelize.define(
    "OfflineClassChatState",
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
        unique: true,
      },
      repliesLocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      pinnedAnnouncement: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "offline_class_chat_states",
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ["class_id"] }],
    }
  );

  OfflineClassChatState.associate = (models) => {
    OfflineClassChatState.belongsTo(models.OfflineClass, {
      foreignKey: "classId",
      as: "offlineClass",
    });

    OfflineClassChatState.belongsTo(models.User, {
      foreignKey: "updatedBy",
      as: "updatedByUser",
    });
  };

  return OfflineClassChatState;
};