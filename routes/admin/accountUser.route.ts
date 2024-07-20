import express, { Router } from "express";
import * as controller from "../../controllers/admin/accountUser.controller";

const router: Router = express.Router();

// router.patch("/change-status/:status/:id", controller.patchChangeStatus);

// router.delete("/delete/:id", controller.deleteAdmin);

// router.patch("/change-multiple/:type", controller.patchMultiple);

// router.get("/update-history/:id", controller.getEditHistory);

router.get("/detail/:id", controller.getUserDetail);

router.get("/", controller.index);

export default router;