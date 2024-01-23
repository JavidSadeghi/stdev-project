import { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
// const { xss } = require("express-xss-sanitizer");
// import hpp from "hpp";
// import swaggerUI from "swagger-ui-express";
// import morgan from "morgan";
// import doc from "../docs/swagger";
import * as resMid from "../middleware/response";
// import config from "../config";
// import logger from "../services/logger";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
    interface Response {
      done: Function;
      notFound: Function;
      unauthorized: Function;
      badRequest: Function;
      unprocessableEntityRequest: Function;
      svcErr: Function;
      ok: Function;
      paymentRequired: Function;
      forbidden: Function;
    }
  }
}

// const allowedOrigins: string[] | string =
//   (config.ALLOWED_ORIGINS || []).length > 0
//     ? config.ALLOWED_ORIGINS?.split(",").map((origin) => origin) ?? "*"
//     : "*";
// const corsOptionsDelegate = function (req: Request, callback: any) {
//   let corsOptions;
//   const origin = req.headers.origin ?? "";
//   if (
//     (origin.length > 1 && allowedOrigins.includes(origin)) ||
//     req.method === "GET"
//   ) {
//     corsOptions = { origin: true };
//   } else {
//     corsOptions = { origin: false };
//   }
//   return callback(
//     corsOptions.origin ? null : new Error("Not allowed by CORS"),
//     corsOptions
//   );
// };

export default function (app: any) {
  app.set("trust proxy", 1);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));


  app.set("json spaces", 2);
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.accepts("application/json")) {
      return res.status(415).json({ message: "Unsupported Media Type" });
    }
    next();
  });

  app.use(resMid.svcErr);
  app.use(resMid.unauthorized);
  app.use(resMid.badRequest);
  app.use(resMid.notFound);
  app.use(resMid.done);
  app.use(resMid.ok);
  app.use(resMid.unprocessableEntityRequest);
  app.use(resMid.paymentRequired);
  app.use(resMid.forbidden);
}
