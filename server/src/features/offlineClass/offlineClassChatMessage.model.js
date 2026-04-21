const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OfflineClassChatMessage = sequelize.define(
    "OfflineClassChatMessage",
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
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageDataUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      audioDataUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "offline_class_chat_messages",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["class_id"] },
        { fields: ["sender_id"] },
        { fields: ["created_at"] },
      ],
    }
  );

  OfflineClassChatMessage.associate = (models) => {
    OfflineClassChatMessage.belongsTo(models.OfflineClass, {
      foreignKey: "classId",
      as: "offlineClass",
    });

    OfflineClassChatMessage.belongsTo(models.User, {
      foreignKey: "senderId",
      as: "sender",
    });
  };

  return OfflineClassChatMessage;
};