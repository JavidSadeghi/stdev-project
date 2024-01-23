import { isNumber } from "util";
import logger from "../services/logger";
interface IError {
  message: string;
}
const errorMapper = (errors: any) => {
  const usefulErrors: IError[] = [];
  errors.map((error: any) => {
    const path = error.path.filter((c: any) => !isNumber(c));
    const len = error.type.search("min") >= 0 || error.type.search("max") >= 0;
    if (path.length > 0) {
      usefulErrors.push({
        message: `error.${path.join(".")}.${
          len ? `${error.type}.${error.context.limit}` : error.type
        }`
      });
    }
  });
  return usefulErrors;
};

export default (values: any, schema: any) => {
  try {
    const options = { abortEarly: false };
    const { error } = schema.validate(values, options);
    let errors = {};
    if (error)
      error.details.forEach((err: any) => {
        errors = {
          ...errors,
          [err.context.key]: err.message
            ?.replace(/"/g, "")
            ?.split("_")
            ?.map((s: any) => s.charAt(0)?.toUpperCase() + s.slice(1))
            ?.join(" ")
        };
      });
    else return null;
    return errors;
  } catch (e) {
    logger.error(e);
    return null;
  }
};
