import { Router } from 'express';
const routerV1 = Router();
import * as authCtl from '../../controllers/authController';
import errorHandler from '../../utils/errorHandler';
import validations from "../../middleware/validations";

routerV1.post('/register', validations.registrationValidation, errorHandler(authCtl.register));
routerV1.post('/login', validations.loginValidation, errorHandler(authCtl.login));


export default routerV1;
