import express, { Router } from "express";
import * as controller from "../../controllers/admin/dashboard.controller";

const router: Router = express.Router();

router.get("/", controller.index);

export default router;