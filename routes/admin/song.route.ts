import express, { Router } from "express";
import * as controller from "../../controllers/admin/song.controller";
import { upload, uploadMultipleFile } from "../../middlewares/admin/upload";
import { validateCreateSong, validateUpdateSong } from "../../validate/admin/song.validate";

const router: Router = express.Router();

router.patch("/change-status/:status/:id", controller.patchChangeStatus);

router.patch("/change-featured/:featured/:id", controller.patchChangeFeatured);

router.delete("/delete/:id", controller.deleteSong);

router.patch("/change-multiple/:type", controller.patchMultiple);

router.get("/create", controller.getCreate);

router.post(
    "/create",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "audio", maxCount: 1 }
    ]),
    uploadMultipleFile,
    validateCreateSong,
    controller.postCreate
);

router.get("/update/:id", controller.getUpdate);

router.patch(
    "/update/:id",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "audio", maxCount: 1 }
    ]),
    uploadMultipleFile,
    validateUpdateSong,
    controller.patchUpdate
);

router.get("/detail/:id", controller.getSongDetail);

router.get("/", controller.index);

export default router;