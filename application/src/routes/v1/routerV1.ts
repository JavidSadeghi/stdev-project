import { Router } from 'express';
const routerV1 = Router();

import authRouterV1 from './auth';
import userRouterV1 from './user';


// API path example:  http://localhost:5000/stdev-server/api/v1/auth
routerV1.use('/auth', authRouterV1);
routerV1.use('/user', userRouterV1);



export default routerV1;
