const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Task = sequelize.define("Task", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM("not-started", "in-progress", "completed"),
    defaultValue: "not-started",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },

  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reminders: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
});

Task.associate = (models) => {
  Task.belongsTo(models.User, { foreignKey: "userId", as: "user" });
};

module.exports = Task;
