import express, { Router } from "express";
import * as controller from "../../controllers/admin/accountAdmin.controller";
import { upload, uploadSingleFile } from "../../middlewares/admin/upload";
import * as validate from "../../validate/admin/admin.validate";
import { checkPermissionForPatchMultiple, checkRolePermission } from "../../middlewares/admin/checkRolePermission";

const router: Router = express.Router();

router.patch(
    "/change-status/:status/:id",
    checkRolePermission({ permission: "update-admin" }),
    controller.patchChangeStatus
);

router.delete(
    "/delete/:id",
    checkRolePermission({ permission: "delete-admin" }),
    controller.deleteAdmin
);

router.patch(
    "/change-multiple/:type",
    checkPermissionForPatchMultiple({ deletePermission: "delete-admin", updatePermission: "update-admin" }),
    controller.patchMultiple
);

router.get(
    "/detail/:id",
    checkRolePermission({ permission: "view-admin" }),
    controller.getAdminDetail
);

router.get(
    "/create",
    checkRolePermission({ permission: "create-admin" }),
    controller.getCreate
);

router.post(
    "/create",
    checkRolePermission({ permission: "create-admin" }),
    upload.single("avatar"),
    validate.create,
    uploadSingleFile,
    controller.postCreate
);

router.get(
    "/update/:id",
    checkRolePermission({ permission: "update-admin" }),
    controller.getUpdate
);

router.patch(
    "/update/:id",
    checkRolePermission({ permission: "update-admin" }),
    upload.single("avatar"),
    validate.update,
    uploadSingleFile,
    controller.patchUpdate
);

router.get(
    "/update-history/:id",
    checkRolePermission({ permission: "view-admin" }),
    controller.getEditHistory
);

router.get(
    "/",
    checkRolePermission({ permission: "view-admin" }),
    controller.index
);

export default router;