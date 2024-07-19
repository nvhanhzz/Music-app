import express, { Router } from "express";
import * as controller from "../../controllers/admin/accountAdmin.controller";
import { upload, uploadSingleFile } from "../../middlewares/admin/upload";
import * as validate from "../../validate/admin/admin.validate";

const router: Router = express.Router();

router.patch("/change-status/:status/:id", controller.patchChangeStatus);

router.delete("/delete/:id", controller.deleteAdmin);

router.patch("/change-multiple/:type", controller.patchMultiple);

router.get("/detail/:id", controller.getAdminDetail);

router.get("/create", controller.getCreate);

router.post(
    "/create",
    upload.single("avatar"),
    uploadSingleFile,
    validate.create,
    controller.postCreate
);

router.get("/update/:id", controller.getUpdate);

router.patch(
    "/update/:id",
    upload.single("avatar"),
    uploadSingleFile,
    validate.update,
    controller.patchUpdate
);

router.get("/update-history/:id", controller.getEditHistory);

router.get("/", controller.index);

export default router;