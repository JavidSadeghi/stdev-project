import { Logger } from 'winston';
import devLogger from "./dev-logger";
import prodLogger from "./prod-logger";
import config from "../../config";

let logger:Logger ;
if (config.NODE_ENV === "development") {
  logger = devLogger();
} else {
  logger = prodLogger();
}

export default logger;
