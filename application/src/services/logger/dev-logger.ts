import { format, createLogger, transports } from "winston";
const { timestamp, combine, printf, errors } = format;
import config from "../../config";

function buildDevLogger() {
  const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}] ${stack || message}`;
  });

  return createLogger({
    level: config.LOGGER_LEVEL,
    format: combine(
      format.colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      logFormat
    ),
    transports: [
      new transports.Console({
        handleExceptions: true,
        handleRejections: true,
      }),
    ],
  });
}

export default buildDevLogger;
