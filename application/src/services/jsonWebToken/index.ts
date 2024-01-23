import jwt from "jsonwebtoken";
import config from "../../config";


export const verify = (token = ""): Promise<{ data: any; error: any }> =>
  new Promise((resolve, reject) => {
    jwt.verify(
      token,
      config.JWT_PRIVATE_KEY || "",
      {
        algorithms: ["HS512"]
      },
      (err: any, decoded: any) => {
        if (err) {
          resolve({ data: null, error: true });
        }
        resolve({ data: decoded, error: null });
      }
    );
  });

export const sign = (payload: object, expiresIn = "1d") =>
  jwt.sign(payload, config.JWT_PRIVATE_KEY || "", {
    algorithm: "HS512",
    expiresIn
  });


