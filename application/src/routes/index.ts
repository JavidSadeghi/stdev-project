import { Router } from "express";
import routerV1 from "./v1/routerV1";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../docs/swagger.json";


const router = Router();

router.use(
  "/stdev-server/api/swagger-ui.html",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);
router.use("/stdev-server/api/v1", routerV1);


export default router;
