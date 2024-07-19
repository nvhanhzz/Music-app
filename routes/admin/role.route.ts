import express, { Router } from "express";
import * as controller from "../../controllers/admin/role.controller";
import * as validate from "../../validate/admin/role.validate";

const router: Router = express.Router();

router.delete("/delete/:id", controller.deleteRole);

router.patch("/change-multiple/:type", controller.patchMultiple);

router.get("/create", controller.getCreate);

router.post("/create", validate.create, controller.postCreate);

router.get("/update/:id", controller.getUpdate);

router.patch("/update/:id", validate.create, controller.patchUpdate);

router.get("/detail/:id", controller.getRoleDetail);

router.get("/", controller.index);

export default router;