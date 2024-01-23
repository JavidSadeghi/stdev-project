import { Router } from 'express';
const routerV1 = Router();
import * as userCtl from '../../controllers/userController';
import errorHandler from '../../utils/errorHandler';
import validations from "../../middleware/validations";
import auth from '../../middleware/auth';

routerV1.get('/', auth, errorHandler(userCtl.userDetail));

routerV1.get('/search', auth, errorHandler(userCtl.userSearch));

routerV1.get('/requests', auth, errorHandler(userCtl.userRequests));

routerV1.post('/request/send/:friend_id', auth, errorHandler(userCtl.userAddFriend));

routerV1.patch('/request/accept/:friend_id', auth, errorHandler(userCtl.userAcceptFriend));

routerV1.patch('/request/reject/:friend_id', auth, errorHandler(userCtl.userRejectFriend));





export default routerV1;