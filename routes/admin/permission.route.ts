import express, { Router } from "express";
import * as controller from "../../controllers/admin/permission.controller";

const router: Router = express.Router();

router.get("/", controller.index);

router.patch("/update", controller.updatePermission);

export default router;