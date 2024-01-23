import { NextFunction, Request, Response } from "express";
import logger from "../services/logger";

export default function (handler: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
