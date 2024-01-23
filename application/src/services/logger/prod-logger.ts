import { format, createLogger, transports, Logger } from "winston";
import Transport from 'winston-transport';
// import apm from 'elastic-apm-node';
import config from "../../config";

const { timestamp, combine, errors, json } = format;

interface WinstonLevels {
  [key: string]: number;
}

const winstonLevels: WinstonLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

interface ApmTransportOptions {
  level?: string;
}


class ApmTransport extends Transport {
  constructor(opts: ApmTransportOptions = {}) {
    super(opts);
  }

  log(info: {level: string, message: string, timestamp: string}, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const envLogLevelNumber = winstonLevels[config.LOGGER_LEVEL ? config.LOGGER_LEVEL : 'INFO'];

    const infoLogLevelNumber = winstonLevels[info.level];

    if (infoLogLevelNumber <= envLogLevelNumber) {
      const error = new Error(info.message);

      // apm.captureError(error, {
      //   custom: {
      //     timestamp: info.timestamp,
      //   },
      // });
    }

    callback();
  }
}

function buildProdLogger(): Logger {
  return createLogger({
    level: config.LOGGER_LEVEL ? config.LOGGER_LEVEL : 'INFO' ,
    format: combine(timestamp(), errors({stack: true}), json()),
    defaultMeta: {service: config.APP_NAME},
    transports: [
      new ApmTransport(),
      new transports.Console(),
      new transports.File({
        filename: "logs/all.log",
      }),
    ],
  });
}

export default buildProdLogger;
