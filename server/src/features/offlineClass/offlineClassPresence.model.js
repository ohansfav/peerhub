const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OfflineClassPresence = sequelize.define(
    "OfflineClassPresence",
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
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastSeenAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "offline_class_presence",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["class_id"] },
        { fields: ["user_id"] },
        { unique: true, fields: ["class_id", "user_id"] },
      ],
    }
  );

  OfflineClassPresence.associate = (models) => {
    OfflineClassPresence.belongsTo(models.OfflineClass, {
      foreignKey: "classId",
      as: "offlineClass",
    });

    OfflineClassPresence.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return OfflineClassPresence;
};