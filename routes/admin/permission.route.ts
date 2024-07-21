import express, { Router } from "express";
import * as controller from "../../controllers/admin/permission.controller";
import { checkRolePermission } from "../../middlewares/admin/checkRolePermission";

const router: Router = express.Router();

router.get(
    "/",
    checkRolePermission({ permission: "update-permission" }),
    controller.index
);

router.patch(
    "/update",
    checkRolePermission({ permission: "update-permission" }),
    controller.updatePermission
);

export default router;