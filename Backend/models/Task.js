// Task Model
// Defines the Task schema and validation rules

import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { TASK_CONFIG } from '../constants/config.js';

const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING(TASK_CONFIG.MAX_TITLE_LENGTH),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(TASK_CONFIG.MAX_DESCRIPTION_LENGTH),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(...TASK_CONFIG.VALID_STATUSES),
    defaultValue: TASK_CONFIG.DEFAULT_STATUS,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: TASK_CONFIG.DEFAULT_PRIORITY,
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
  Task.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

export default Task;
