import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { commerceRouter } from '../commerce/routes';

const router: IRouter = Router();

router.use(healthRouter);
router.use(commerceRouter);

export default router;
