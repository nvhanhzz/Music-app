import express, { Router } from "express";
import * as controller from "../../controllers/admin/topic.controller";
import * as validate from "../../validate/admin/topic.validate";
import { upload, uploadSingleFile } from "../../middlewares/admin/upload";
import { checkPermissionForPatchMultiple, checkRolePermission } from "../../middlewares/admin/checkRolePermission";

const router: Router = express.Router();

router.patch(
    "/change-status/:status/:id",
    checkRolePermission({ permission: "update-topic" }),
    controller.patchChangeStatus
);

router.patch(
    "/change-featured/:featured/:id",
    checkRolePermission({ permission: "update-topic" }),
    controller.patchChangeFeatured
);

router.delete(
    "/delete/:id",
    checkRolePermission({ permission: "delete-topic" }),
    controller.deleteTopic
);

router.patch(
    "/change-multiple/:type",
    checkPermissionForPatchMultiple({ deletePermission: "delete-topic", updatePermission: "update-topic" }),
    controller.patchMultiple
);

router.get(
    "/create",
    checkRolePermission({ permission: "create-topic" }),
    controller.getCreate
);

router.post(
    "/create",
    checkRolePermission({ permission: "create-topic" }),
    upload.single("avatar"),
    uploadSingleFile,
    validate.create,
    controller.postCreate
);

router.get(
    "/update/:id",
    checkRolePermission({ permission: "update-topic" }),
    controller.getUpdate
);

router.patch(
    "/update/:id",
    checkRolePermission({ permission: "update-topic" }),
    upload.single("avatar"),
    uploadSingleFile,
    validate.update,
    controller.patchUpdate
);

router.get(
    "/detail/:id",
    checkRolePermission({ permission: "view-topic" }),
    controller.getDetail
);

router.get(
    "/update-history/:id",
    checkRolePermission({ permission: "view-topic" }),
    controller.getEditHistory
);

router.get(
    "/",
    checkRolePermission({ permission: "view-topic" }),
    controller.index
);

export default router;