import express, { Router } from "express";
import * as controller from "../../controllers/admin/accountUser.controller";
import { checkPermissionForPatchMultiple, checkRolePermission } from "../../middlewares/admin/checkRolePermission";

const router: Router = express.Router();

router.patch(
    "/change-status/:status/:id",
    checkRolePermission({ permission: "update-user" }),
    controller.patchChangeStatus
);

router.delete(
    "/delete/:id",
    checkRolePermission({ permission: "delete-user" }),
    controller.deleteUser
);

router.patch(
    "/change-multiple/:type",
    checkPermissionForPatchMultiple({ deletePermission: "delete-user", updatePermission: "update-user" }),
    controller.patchMultiple
);

router.get(
    "/update-history/:id",
    checkRolePermission({ permission: "view-user" }),
    controller.getEditHistory
);

router.get(
    "/detail/:id",
    checkRolePermission({ permission: "view-user" }),
    controller.getUserDetail
);

router.get(
    "/",
    checkRolePermission({ permission: "view-user" }),
    controller.index
);

export default router;