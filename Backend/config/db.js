// Database Configuration
// PostgreSQL connection using Sequelize ORM

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { DB_CONFIG } from '../constants/config.js';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: DB_CONFIG.LOGGING,
    pool: {
      max: DB_CONFIG.POOL_MAX,
      min: DB_CONFIG.POOL_MIN,
      acquire: DB_CONFIG.POOL_ACQUIRE,
      idle: DB_CONFIG.POOL_IDLE,
    },
  }
);

sequelize
  .authenticate()
  .then(() => console.log('Database connection established successfully'))
  .catch((err) => console.error('Unable to connect to the database:', err));

export default sequelize;
