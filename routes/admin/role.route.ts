import express, { Router } from "express";
import * as controller from "../../controllers/admin/role.controller";

const router: Router = express.Router();

router.delete("/delete/:id", controller.deleteRole);

router.patch("/change-multiple/:type", controller.patchMultiple);

router.get("/", controller.index);

export default router;