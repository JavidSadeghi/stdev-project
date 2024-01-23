import config from './config';
import express, { Express, NextFunction, Request, Response } from 'express';
import bodyParser from "body-parser";
import errorHandler from './middleware/errorHandler';
import logger from './services/logger';
import { sequelize } from './models';
import router from './routes';
import expressConf from "./startup/express-conf"

const app = express();
expressConf(app);


app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.accepts("application/json")) {
    return res.status(415).json({ message: "Unsupported Media Type" });
  }
  next();
});

app.use('/', router);
// Global Error handler
app.use(errorHandler);


if (config.NODE_ENV != 'test')
  sequelize.authenticate().then(() => {
    logger.info(`The database connection [${config.DATABASE_NAME}] was successfully`);
    app.listen(config.SERVER_PORT ?? 5000, () => {
      logger.info(`STDev api server is running at ${config.SERVER_PORT}`);
    });
  });