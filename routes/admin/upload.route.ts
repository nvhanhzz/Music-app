import express, { Router } from "express";
import * as controller from "../../controllers/admin/upload.controller";
import { upload, uploadSingleFile } from "../../middlewares/admin/upload";

const router: Router = express.Router();

router.post(
    "/",
    upload.single("file"),
    uploadSingleFile,
    controller.uploadTinyMce
);

export default router;