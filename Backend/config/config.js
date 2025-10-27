const dotenv = require("dotenv");

dotenv.config();

const config = {
  server: {
    port: process.env.PORT || 5001,
  },
  database: {
    dbName: process.env.DB_NAME,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbHost: process.env.DB_HOST || "localhost",
    dbPort: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || "postgres",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your_secret_key",
    expiration: process.env.JWT_EXPIRATION || "1h",
  },
  other: {
    appName: process.env.APP_NAME || "Task Manager App",
  },
};

module.exports = config;
