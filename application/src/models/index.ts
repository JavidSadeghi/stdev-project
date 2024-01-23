import config from "../config";
import logger from "../services/logger";
import { Sequelize } from "sequelize-typescript";
import { ConnectionError, ConnectionTimedOutError } from "sequelize";

import { Users } from "./user";
import { Friendships } from "./friendship";

const env = config.NODE_ENV ?? "development";

let sequelize: Sequelize;
if (env == "test") {
  const { newDb } = require("pg-mem");
  const mem = newDb();
  sequelize = new Sequelize({
    dialect: "postgres",
    dialectModule: mem.adapters.createPg(),
    logging: false
  });
} else {
  sequelize = new Sequelize({
    username: config.DATABASE_USER,
    password: config.DATABASE_PASSWORD,
    database: config.DATABASE_NAME,
    host: config.DATABASE_HOST,
    port: Number(config.DATABASE_PORT ?? 5001),
    logging: (msg) => {
      if (env === "development") {
        logger.info(msg);
      }
    },
    dialect: "postgres",
    schema: "stdev_db",
    pool: {
      max: 10,
      min: 1,
      acquire: 60000,
      idle: 60000
    },
    retry: {
      match: [ConnectionError, ConnectionTimedOutError, /Deadlock/i],
      max: 3 // Maximum retry 3 times
    }
  });
}

sequelize.addModels([
  Users,
  Friendships
]);

export {
  sequelize,
  Sequelize,
  Users,
  Friendships
};
