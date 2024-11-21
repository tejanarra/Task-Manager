const { Sequelize } = require("sequelize");
// import "pg"
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Database connection established successfully"))
  .catch((err) => console.error("Unable to connect to the database:", err));

module.exports = sequelize;
