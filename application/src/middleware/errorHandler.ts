import { NextFunction, Request, Response } from "express";
import { BaseError } from "sequelize";
import LogService from "../services/logger";
import createHttpError from "http-errors";
import config from "../config";

interface ILogPayload {
  name: string;
  code: string;
  level: string;
  message: string;
  element?: any;
  path?: string;
  external_request_path?: string;
  location?: string | null;
}

export default async function(
  errObject: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let err = errObject;
    cleanBuffers(err);

    let isExternalServiceError = false;
    let instanceName, statusCode, stackTrace, message;

    let logPayload: ILogPayload = {
      name: "",
      code: "",
      level: "",
      message: "",
      element: "",
      path: "",
      external_request_path: ""
    };
    let errorPayload = {
      code: "",
      message: "",
      element: null
    };

    if (err.isAxiosError) {
      if (err.response && err.response.data) {
        instanceName = createHttpError(err.response.status).name;
        statusCode = err.response.status;
        message = err.response.data.message
          ? err.response.data.message
          : err.message;
        stackTrace = err.response.data;
        errorPayload.element = err.response.data.element;
        logPayload.code = err.response.data.code;
        logPayload.element = err.response.data.element;
      } else {
        isExternalServiceError = true;
        instanceName = "AxiosCommunicationError";
        statusCode = 503;
        message = "Service unavailable. Please try again later";
        stackTrace = err?.stack ?? err;
        logPayload.code = "ISAXKO001";
        logPayload.element = err?.stack ?? err;
      }

      logPayload = {
        name: instanceName,
        code: logPayload.code,
        level:
          statusCode < 429
            ? "debug"
            : statusCode >= 429 && statusCode < 500
              ? "warn"
              : "error",
        message,
        element: logPayload.element,
        path: req.originalUrl,
        external_request_path: err.config.url,
        location: getFileAndLine(stackTrace) ?? null
      };

      errorPayload = {
        code: logPayload.code,
        message: logPayload.message,
        element: errorPayload.element
      };
    } else if (createHttpError.isHttpError(err)) {
      const { stack, details, code, message, error } = err;

      instanceName = err.constructor.name;
      statusCode = err.statusCode;
      stackTrace = stack;

      logPayload = {
        name: instanceName,
        code,
        level:
          statusCode < 429
            ? "debug"
            : statusCode >= 429 && statusCode < 500
              ? "warn"
              : "error",
        message: details || message,
        element: stackTrace,
        path: req.originalUrl,
        location: getFileAndLine(stackTrace) ?? null
      };

      errorPayload = {
        code,
        message,
        element: error ? error : null
      };
    } else if (err.message === "Not allowed by CORS") {
      return res.status(403).json({
        code: "Ko",
        message: "You can't access to this service from your origin",
        element: null
      });
    } else if (
      err.name === "SequelizeDatabaseError" ||
      err instanceof BaseError
    ) {
      instanceName = err.name;
      statusCode = 500;
      stackTrace = err?.stack ?? err;

      logPayload = {
        name: instanceName,
        code: "SEQKO001",
        level: "error",
        message: err.message,
        element: stackTrace,
        path: req.originalUrl,
        location: getFileAndLine(stackTrace) ?? null
      };

      errorPayload = {
        code: "ISSYKO001",
        message: "Internal Server Error.",
        element: null
      };

      // Log the complete SQL error and query
      const sequelizeError = err.original;
      if (sequelizeError) {
        logPayload.message = `${logPayload.message}\nSQL Error: ${sequelizeError.sql}`;
        logPayload.element = JSON.stringify({
          ...sequelizeError,
          sql: sequelizeError.sql,
          bindings: sequelizeError.bindings
        });
      }
    } else {
      instanceName = Object.getPrototypeOf(err);
      statusCode = 500;
      stackTrace = err?.stack ?? err;

      logPayload = {
        name: instanceName,
        code: "ISSYKO001",
        level: "error",
        message: err.message,
        element: stackTrace,
        location: getFileAndLine(stackTrace) ?? null
      };

      errorPayload = {
        code: "ISSYKO001",
        message: "Internal Server Error.",
        element: null
      };
    }

    if (config.NODE_ENV !== "production")
      LogService.log(logPayload.level, JSON.stringify(logPayload));
    else LogService.log(logPayload.level, logPayload);

    res.status(statusCode || 500).send(errorPayload);

    // if (
    //   (err.isAxiosError &&
    //     isExternalServiceError &&
    //     statusCode >= 500 &&
    //     config.NODE_ENV === "production") ||
    //   (!err.isAxiosError &&
    //     statusCode >= 500 &&
    //     config.NODE_ENV === "production")
    // )
    //   if (config.NODE_ENV === "production")
    //     await kmmErrorReport(JSON.stringify(logPayload), config.APP_NAME);
  } catch (error) {
    LogService.error(error);
    next(error);
  }
}

const getFileAndLine = (stackTrace: any): string | null => {
  const lines = stackTrace?.split("\n");
  if (lines?.length > 1) {
    const match = lines[1]?.match(/\(([^:]+):(\d+):\d+\)/);
    if (match) {
      return `file: ${match[1]}, line: ${match[2]}`;
    }
  }
  return stackTrace;
};


const isBuffer = (obj: any) => {
  // Example check, adjust as necessary for your use case
  return obj && obj.type === 'Buffer' && Array.isArray(obj.data);
};

const cleanBuffers = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  Object.keys(obj).forEach((key) => {
    if (isBuffer(obj[key])) {
      delete obj[key];
    } else {
      cleanBuffers(obj[key]);
    }
  });
  return obj;
};
