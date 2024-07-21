import express, { Router } from "express";
import * as controller from "../../controllers/admin/singer.controller";
import * as validate from "../../validate/admin/singer.validate";
import { upload, uploadSingleFile } from "../../middlewares/admin/upload";
import { checkPermissionForPatchMultiple, checkRolePermission } from "../../middlewares/admin/checkRolePermission";

const router: Router = express.Router();

router.patch(
    "/change-status/:status/:id",
    checkRolePermission({ permission: "update-singer" }),
    controller.patchChangeStatus
);

router.patch(
    "/change-featured/:featured/:id",
    checkRolePermission({ permission: "update-singer" }),
    controller.patchChangeFeatured
);

router.delete(
    "/delete/:id",
    checkRolePermission({ permission: "delete-singer" }),
    controller.deleteSinger
);

router.patch(
    "/change-multiple/:type",
    checkPermissionForPatchMultiple({ deletePermission: "delete-singer", updatePermission: "update-singer" }),
    controller.patchMultiple
);

router.get(
    "/create",
    checkRolePermission({ permission: "create-singer" }),
    controller.getCreate
);

router.post(
    "/create",
    checkRolePermission({ permission: "create-singer" }),
    upload.single("avatar"),
    validate.create,
    uploadSingleFile,
    controller.postCreate
);

router.get(
    "/update/:id",
    checkRolePermission({ permission: "update-singer" }),
    controller.getUpdate
);

router.patch(
    "/update/:id",
    checkRolePermission({ permission: "update-singer" }),
    upload.single("avatar"),
    validate.update,
    uploadSingleFile,
    controller.patchUpdate
);

router.get(
    "/detail/:id",
    checkRolePermission({ permission: "view-singer" }),
    controller.getDetail
);

router.get(
    "/update-history/:id",
    checkRolePermission({ permission: "view-singer" }),
    controller.getEditHistory
);

router.get(
    "/",
    checkRolePermission({ permission: "view-singer" }),
    controller.index
);

export default router;