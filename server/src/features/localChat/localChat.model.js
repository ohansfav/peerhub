const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LocalChatMessage = sequelize.define(
    "LocalChatMessage",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      recipientId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "local_chat_messages",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["sender_id"] },
        { fields: ["recipient_id"] },
        { fields: ["created_at"] },
      ],
    }
  );

  LocalChatMessage.associate = (models) => {
    LocalChatMessage.belongsTo(models.User, {
      foreignKey: "senderId",
      as: "sender",
    });

    LocalChatMessage.belongsTo(models.User, {
      foreignKey: "recipientId",
      as: "recipient",
    });
  };

  return LocalChatMessage;
};
