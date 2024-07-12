import express, { Router } from "express";
import * as controller from "../../controllers/client/topic.controller";

const router: Router = express.Router();

router.get("/", controller.test);

export default router;