import express, { Router } from "express";
import * as controller from "../../controllers/admin/topic.controller";

const router: Router = express.Router();

router.patch("/change-status/:status/:id", controller.patchChangeStatus);

router.patch("/change-featured/:featured/:id", controller.patchChangeFeatured);

router.delete("/delete/:id", controller.deleteTopic);

router.get("/", controller.index);

export default router;