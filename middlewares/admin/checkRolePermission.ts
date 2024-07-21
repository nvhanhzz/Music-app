import { NextFunction, Request, Response } from "express";
const PATH_ADMIN = process.env.PATH_ADMIN;

interface Permission {
    permission: string;
}

interface PatchMultiplePermission {
    deletePermission: string;
    updatePermission: string;
}

export const checkRolePermission = (options: Permission = { permission: '' }) => {
    const { permission } = options;

    return (req: Request & { [key: string]: any }, res: Response, next: NextFunction) => {
        const permissions = res.locals.currentAdmin.roleId.permission;
        if (!permissions.includes(permission)) {
            req.flash("fail", "Bạn không đủ quyền.");
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }

        return next();
    }
}

export const checkPermissionForPatchMultiple = (options: PatchMultiplePermission = { deletePermission: '', updatePermission: '' }) => {
    const { deletePermission, updatePermission } = options;

    return (req: Request & { [key: string]: any }, res: Response, next: NextFunction) => {
        const permissions = res.locals.currentAdmin.roleId.permission;
        const type = req.params.type;
        if ((type === "delete" && !permissions.includes(deletePermission)) || (type !== "delete" && !permissions.includes(updatePermission))) {
            req.flash("fail", "Bạn không đủ quyền.");
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }

        return next();
    }
}