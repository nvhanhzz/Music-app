"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermissionForPatchMultiple = exports.checkRolePermission = void 0;
const PATH_ADMIN = process.env.PATH_ADMIN;
const checkRolePermission = (options = { permission: '' }) => {
    const { permission } = options;
    return (req, res, next) => {
        const permissions = res.locals.currentAdmin.roleId.permission;
        if (!permissions.includes(permission)) {
            req.flash("fail", "Bạn không đủ quyền.");
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }
        return next();
    };
};
exports.checkRolePermission = checkRolePermission;
const checkPermissionForPatchMultiple = (options = { deletePermission: '', updatePermission: '' }) => {
    const { deletePermission, updatePermission } = options;
    return (req, res, next) => {
        const permissions = res.locals.currentAdmin.roleId.permission;
        const type = req.params.type;
        if ((type === "delete" && !permissions.includes(deletePermission)) || (type !== "delete" && !permissions.includes(updatePermission))) {
            req.flash("fail", "Bạn không đủ quyền.");
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }
        return next();
    };
};
exports.checkPermissionForPatchMultiple = checkPermissionForPatchMultiple;
