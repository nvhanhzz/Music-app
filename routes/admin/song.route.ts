import express, { Router } from "express";
import * as controller from "../../controllers/admin/song.controller";
import { upload, uploadMultipleFile } from "../../middlewares/admin/upload";
import { validateCreateSong, validateUpdateSong } from "../../validate/admin/song.validate";
import { checkPermissionForPatchMultiple, checkRolePermission } from "../../middlewares/admin/checkRolePermission";

const router: Router = express.Router();

router.patch(
    "/change-status/:status/:id",
    checkRolePermission({ permission: "update-song" }),
    controller.patchChangeStatus
);

router.patch(
    "/change-featured/:featured/:id",
    checkRolePermission({ permission: "update-song" }),
    controller.patchChangeFeatured
);

router.delete(
    "/delete/:id",
    checkRolePermission({ permission: "delete-song" }),
    controller.deleteSong
);

router.patch(
    "/change-multiple/:type",
    checkPermissionForPatchMultiple({ deletePermission: "delete-song", updatePermission: "update-song" }),
    controller.patchMultiple
);

router.get(
    "/create",
    checkRolePermission({ permission: "create-song" }),
    controller.getCreate
);

router.post(
    "/create",
    checkRolePermission({ permission: "create-song" }),
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "audio", maxCount: 1 }
    ]),
    validateCreateSong,
    uploadMultipleFile,
    controller.postCreate
);

router.get(
    "/update/:id",
    checkRolePermission({ permission: "update-song" }),
    controller.getUpdate
);

router.patch(
    "/update/:id",
    checkRolePermission({ permission: "update-song" }),
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "audio", maxCount: 1 }
    ]),
    validateUpdateSong,
    uploadMultipleFile,
    controller.patchUpdate
);

router.get(
    "/detail/:id",
    checkRolePermission({ permission: "view-song" }),
    controller.getSongDetail
);

router.get(
    "/update-history/:id",
    checkRolePermission({ permission: "view-song" }),
    controller.getEditHistory
);

router.get(
    "/",
    checkRolePermission({ permission: "view-song" }),
    controller.index
);

export default router;