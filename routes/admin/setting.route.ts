import express, { Router } from "express";
import * as controller from "../../controllers/admin/setting.controller";
import { checkRolePermission } from "../../middlewares/admin/checkRolePermission";
import { upload, uploadSingleFile } from "../../middlewares/admin/upload";

const router: Router = express.Router();

router.get(
    "/general",
    checkRolePermission({ permission: "update-general-setting" }),
    controller.index
);

router.patch(
    "/general",
    upload.single("logo"),
    uploadSingleFile,
    controller.update
);

export default router;