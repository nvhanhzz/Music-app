import express, { Router } from "express";
import * as controller from "../../controllers/admin/singer.controller";
import * as validate from "../../validate/admin/singer.validate";
import { upload, uploadSingleFile } from "../../middlewares/admin/upload";

const router: Router = express.Router();

router.patch("/change-status/:status/:id", controller.patchChangeStatus);

router.patch("/change-featured/:featured/:id", controller.patchChangeFeatured);

router.delete("/delete/:id", controller.deleteSinger);

router.patch("/change-multiple/:type", controller.patchMultiple);

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

router.get("/detail/:id", controller.getDetail);

router.get("/update-history/:id", controller.getEditHistory);

router.get("/", controller.index);

export default router;