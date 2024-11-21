const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
import "pg"

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
});

Task.associate = (models) => {
  Task.belongsTo(models.User, { foreignKey: "userId", as: "user" });
};

module.exports = Task;
