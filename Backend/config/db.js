const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,        // "postgres"
  process.env.DB_USER,        // "postgres"
  process.env.DB_PASSWORD,    // [YOUR-PASSWORD]
  {
    host: process.env.DB_HOST,  // "aws-0-us-east-1.pooler.supabase.com"
    dialect: process.env.DB_DIALECT, // "postgres"
    port: process.env.DB_PORT,  // 6543
    logging: false,             // Optional: Set to false to disable Sequelize query logging
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Database connection established successfully"))
  .catch((err) => console.error("Unable to connect to the database:", err));

module.exports = sequelize;
