import { NextFunction, Request, Response } from "express";
import * as Joi from "joi";
import ErrorMapper from "../utils/errorMapper";
import { ObjectSchema } from "joi";
import createError from "http-errors"
// import { Template } from "../models/profile";
// import moment from "moment";

function checkSchema(
  values: any,
  schema: ObjectSchema,
  res: Response,
  next: NextFunction
) {
  const error = ErrorMapper(values, schema);
  if (error) throw new createError.UnprocessableEntity(JSON.stringify(error));
  next();
}

function registrationValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const values = req.body;
  const schema = Joi.object({
    user_first_name: Joi.string().min(1).max(50).required().label("first name"),
    user_last_name: Joi.string().min(1).max(100).required().label("last name"),
    user_age: Joi.number().required().label("age"),
    user_email: Joi.string().min(1).max(40).email().label("email").required(),
    user_password: Joi.string().min(8).max(50)
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .label("password").required(),
    confirm_password: Joi.string().min(8).max(50)
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .label("confirm password").required(),
  });
  return checkSchema(values, schema, res, next);
}

function loginValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const values = req.body;
  const schema = Joi.object({
    user_email: Joi.string().min(1).max(40).email().label("email").required(),
    user_password: Joi.string().min(8).max(50).label("password").required(),
  });
  return checkSchema(values, schema, res, next);
}



function paginationValidation(req: Request, res: Response, next: NextFunction) {
  const values = req.query;
  const from = new Date();
  const to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
  from.setSeconds(0);
  from.setMinutes(0);
  from.setHours(0);
  to.setSeconds(59);
  to.setMinutes(59);
  to.setHours(23);
  const schema = Joi.object({
    page: Joi.number().min(1).allow(null).default(1).label("The Page"),
    limit: Joi.number()
      .min(1)
      .max(100)
      .allow(null)
      .default(10)
      .label("The Limit"),
    from: Joi.date().allow(null).default(from),
    to: Joi.date().allow(null).default(to)
  });
  return checkSchema(values, schema, res, next);
}






const validations = {
  registrationValidation,
  loginValidation
};
export default validations;
