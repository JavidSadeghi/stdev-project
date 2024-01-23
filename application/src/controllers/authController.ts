import { NextFunction, Request, Response, RequestHandler } from "express";
import * as JWT from "../services/jsonWebToken";
import pick from "lodash.pick";
import { v4 as uuidV4 } from "uuid";
import { Users } from "../models";
import bcrypt from "bcrypt"



export const register: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const body = pick(req.body, ["user_email", "user_password", "confirm_password", "user_first_name", "user_last_name", "user_age"]);
  
    // check if user exist
    const userExist = await Users.findOne({
      where: { user_email: body.user_email }
    });

    if(userExist) return res.unprocessableEntityRequest({ message: "User already exist!" });

    // password should equel to confirm password
    if(body.user_password !== body.confirm_password) return res.badRequest({ message: "Confirm password is not equal to password!" });

    // create user's row in database
    let user = new Users();
    user.user_identification = uuidV4();
    user.user_email= body.user_email;
    user.user_age= body.user_age;
    if(body.user_first_name)
      user.user_first_name= body.user_first_name;
    if(body.user_last_name)
      user.user_last_name= body.user_last_name;

    // hash the password before insert to database
    const salt = await bcrypt.genSalt(10);
    user.user_password = await bcrypt.hash(body.user_password, salt);

    await user.save();

    const payload = {
      user: {
        user_identification: user.user_identification
      }
    }

    // create JWT token with user's identification
    const token = JWT.sign(payload);

    return res.done({ token })
};

export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const body = pick(req.body, ["user_email", "user_password"]);
    
    // check if user exist
    const userExist = await Users.findOne({
      where: { user_email: body.user_email }
    });
  
    if(!userExist) return res.notFound({ message: "Invalid Credentials!" });
    
    // Check user's password
    const isMatch = await bcrypt.compare(body.user_password, userExist.user_password);

    if(!isMatch) return res.notFound({ message: "Invalid Credentials!" });

    const payload = {
      user: {
        user_identification: userExist.user_identification
      }
    }

    // create JWT token with user's identification
    const token = JWT.sign(payload);

    return res.done({ token })
}