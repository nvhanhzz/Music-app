import express, { Router } from "express";
import * as controller from "../../controllers/admin/topic.controller";

const router: Router = express.Router();

router.patch("/change-status/:status/:id", controller.patchChangeStatus);

router.patch("/change-featured/:featured/:id", controller.patchChangeFeatured);

router.delete("/delete/:id", controller.deleteTopic);

router.patch("/change-multiple/:type", controller.patchMultiple);

router.get("/detail/:id", controller.getDetail);

router.get("/update-history/:id", controller.getEditHistory);

router.get("/", controller.index);

export default router;