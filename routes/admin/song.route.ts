import express, { Router } from "express";
import * as controller from "../../controllers/admin/song.controller";

const router: Router = express.Router();

router.patch("/change-status/:status/:id", controller.patchChangeStatus);

router.delete("/delete/:id", controller.deleteSong);

router.get("/", controller.index);

export default router;