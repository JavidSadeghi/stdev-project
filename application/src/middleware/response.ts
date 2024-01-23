import { RequestHandler } from "express";
import ErrorCodes from "../utils/ErrorCodes";
import { STATUS_CODES } from "http";

export const svcErr: RequestHandler = function (req, res, next) {
  res.svcErr = function (error: { code: number; data: any }) {
    const httpsStatusCode: number =
      error?.code && !!STATUS_CODES[error?.code] ? error.code : 500;
    res.status(httpsStatusCode).json(error.data);
  };
  next();
};

export const unauthorized: RequestHandler = function (req, res, next) {
  res.unauthorized = function (
    message = "You are not authorized to access this page"
  ) {
    res
      .status(401)
      .json({ code: ErrorCodes.ISSYKO005, message, element: null });
  };
  next();
};

export const notFound: RequestHandler = function (req, res, next) {
  res.notFound = function (
    message: string = "We could not find what you were looking for",
    code: string = ErrorCodes.ISSYKO002
  ) {
    res.status(404).json({ code, message, element: null });
  };
  next();
};

export const badRequest: RequestHandler = function (req, res, next) {
  res.badRequest = function (
    message: string,
    error: any,
    code: string = ErrorCodes.ISSYKO004
  ) {
    return res.status(400).json({
      code,
      message,
      element: error
    });
  };
  next();
};

export const unprocessableEntityRequest: RequestHandler = function (
  req,
  res,
  next
) {
  res.unprocessableEntityRequest = function ({
    element,
    message,
    code
  }: {
    element?: any;
    message?: string;
    code?: string;
  }) {
    message = message ?? "Validation failed, please check your data";
    element = element ?? null;
    code = code ?? ErrorCodes.ISSYKO004;
    return res.status(422).json({
      code,
      message,
      element
    });
  };
  next();
};

export const done: RequestHandler = function (req, res, next) {
  res.done = function (data: any) {
    res.status(200).json(data);
  };
  next();
};

export const ok: RequestHandler = function (req, res, next) {
  res.ok = function (data: any, code = "Ok", message = null) {
    res.status(200).json({
      code,
      message: message || "Success",
      element: data || null
    });
  };
  next();
};

export const paymentRequired: RequestHandler = function (req, res, next) {
  res.paymentRequired = function (
    message = "You don't have a plan, please select a plan to continue"
  ) {
    res
      .status(402)
      .json({ code: ErrorCodes.ISSYKO006, message, element: null });
  };
  next();
};

export const forbidden: RequestHandler = function (req, res, next) {
  res.forbidden = function (
    message = "You don't have permission to perform this action"
  ) {
    res
      .status(403)
      .json({ code: ErrorCodes.ISSYKO007, message, element: null });
  };
  next();
};
