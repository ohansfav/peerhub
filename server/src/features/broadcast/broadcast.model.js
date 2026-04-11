const sequelize = require("@src/shared/database/index");
const { DataTypes } = require("sequelize");

module.exports = () => {
  const BroadcastMessage = sequelize.define(
    "BroadcastMessage",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "sender_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      targetRole: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "target_role",
        comment: "null = everyone, student = students only, tutor = tutors only",
      },
    },
    {
      tableName: "broadcast_messages",
      underscored: true,
      timestamps: true,
    }
  );

  BroadcastMessage.associate = (models) => {
    BroadcastMessage.belongsTo(models.User, {
      foreignKey: "senderId",
      as: "sender",
    });
  };
};
