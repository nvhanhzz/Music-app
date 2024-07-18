import { Request, Response } from "express";
import Role from "../../models/role.model";
const prefixAdmin = process.env.PATH_ADMIN

export const index = async (req: Request, res: Response): Promise<void> => {
    // const permission = res.locals.currentUser.role.permission;
    // if (permission.includes('permission')) {
    const roles = await Role.find({ deleted: false });
    res.render("admin/pages/permission/index", {
        roles: roles,
        pageTitle: "Permission"
    });
    // } else {
    //     res.send("No permission");
    // }
}

// [PATCH] /admin/roles/update-permission
export const updatePermission = async (req: Request, res: Response): Promise<void> => {
    console.log("1", req.body.permissions);
    const permission = res.locals.currentAdmin.roleId.permission;
    console.log(permission);
    const adminId = res.locals.currentAdmin._id; // Giả sử adminId được lưu ở đây

    // if (permission.includes('permission')) {
    try {
        const permissions = JSON.parse(req.body.permissions);
        for (const item of permissions) {
            await Role.updateOne({
                _id: item.id,
                deleted: false
            }, {
                $set: {
                    permission: item.listPermission
                },
                $push: {
                    updatedBy: {
                        adminId: adminId,
                        updatedAt: new Date()
                    }
                }
            });
        }
        req.flash("success", "Cập nhật phân quyền thành công");
        res.redirect("back");
    } catch (error) {
        req.flash("fail", "Lỗi, hãy thử lại");
        res.redirect(`${prefixAdmin}/dashboard`);
    }
    // } else {
    //     res.send("No permission");
    // }
}