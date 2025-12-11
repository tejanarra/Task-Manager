// User Model
// Defines the User schema and validation rules

import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { VALIDATION_CONFIG } from '../constants/config.js';

const User = sequelize.define(
  'User',
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [VALIDATION_CONFIG.NAME_MIN_LENGTH, VALIDATION_CONFIG.NAME_MAX_LENGTH],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [VALIDATION_CONFIG.NAME_MIN_LENGTH, VALIDATION_CONFIG.NAME_MAX_LENGTH],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: VALIDATION_CONFIG.PHONE_REGEX,
      },
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString().split('T')[0],
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verificationCodeExpiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, VALIDATION_CONFIG.BIO_MAX_LENGTH],
      },
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'UTC',
      comment: 'User timezone in IANA format (e.g., America/New_York, Europe/London, Asia/Tokyo)',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  }
);

// NOTE: Password hashing is now handled explicitly in controllers using passwordUtils
// This avoids double-hashing and gives better control over password management

export default User;
