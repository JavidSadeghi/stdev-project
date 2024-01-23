import { NextFunction, Request, Response } from "express";
import { verify } from "../services/jsonWebToken";
import logger from "../services/logger";

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.header("x-auth-token")) {
      return res.unauthorized("You must be logged in to access this page");
    }
    const token = req.header("x-auth-token");
    const { data, error } = await verify(token);
    if (error) {
      return res.unauthorized("Your session has expired, please login again");
    }

    if(data?.user?.user_identification)
      req.userId = data?.user?.user_identification;

    next();
  } catch (error) {
    logger.error(`error on auth middleware : ${error}`);
    return res.unauthorized("You cannot access this page at this time");
  }
}
