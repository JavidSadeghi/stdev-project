import dotenv from "dotenv";

dotenv.config();

 export default {
  NODE_ENV: process.env.NODE_ENV,
  APP_NAME: process.env.APP_NAME,
  SERVER_PORT: process.env.SERVER_PORT,
  APP_VERSION: process.env.APP_VERSION,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_NAME: process.env.DATABASE_NAME,
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  LOGGER_LEVEL: process.env.LOGGER_LEVEL,
  MAINTAINER_EMAIL: process.env.MAINTAINER_EMAIL,
  JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY
};