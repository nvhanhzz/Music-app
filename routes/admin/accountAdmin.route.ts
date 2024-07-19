import express, { Router } from "express";
import * as controller from "../../controllers/admin/accountAdmin.controller";

const router: Router = express.Router();

router.patch("/change-status/:status/:id", controller.patchChangeStatus);

router.get("/", controller.index);

export default router;