require('dotenv').config();

const config = {
  port: process.env.PORT,
  frontend_url: process.env.FRONTEND_URL,
  db: {
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DATABASE
  }
};

module.exports = config;