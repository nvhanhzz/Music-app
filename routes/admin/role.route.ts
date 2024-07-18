import express, { Router } from "express";
import * as controller from "../../controllers/admin/role.controller";

const router: Router = express.Router();

router.get("/", controller.index);

export default router;