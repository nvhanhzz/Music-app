import express, { Router } from "express";
import * as controller from "../../controllers/admin/role.controller";
import * as validate from "../../validate/admin/role.validate";
import { checkPermissionForPatchMultiple, checkRolePermission } from "../../middlewares/admin/checkRolePermission";

const router: Router = express.Router();

router.delete(
    "/delete/:id",
    checkRolePermission({ permission: "delete-role" }),
    controller.deleteRole
);

router.patch(
    "/change-multiple/:type",
    checkPermissionForPatchMultiple({ deletePermission: "delete-role", updatePermission: "update-role" }),
    controller.patchMultiple
);

router.get(
    "/create",
    checkRolePermission({ permission: "create-role" }),
    controller.getCreate
);

router.post(
    "/create",
    checkRolePermission({ permission: "create-role" }),
    validate.create,
    controller.postCreate);

router.get(
    "/update/:id",
    checkRolePermission({ permission: "update-role" }),
    controller.getUpdate
);

router.patch(
    "/update/:id",
    checkRolePermission({ permission: "update-role" }),
    validate.create,
    controller.patchUpdate
);

router.get(
    "/update-history/:id",
    checkRolePermission({ permission: "view-role" }),
    controller.getEditHistory
);

router.get(
    "/detail/:id",
    checkRolePermission({ permission: "view-role" }),
    controller.getRoleDetail
);

router.get(
    "/",
    checkRolePermission({ permission: "view-role" }),
    controller.index
);

export default router;