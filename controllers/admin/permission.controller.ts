import { Request, Response } from "express";
import Role from "../../models/role.model";
const PATH_ADMIN = process.env.PATH_ADMIN

// [GET] /admin/permissions
export const index = async (req: Request, res: Response): Promise<void> => {
    const roles = await Role.find({ deleted: false });
    res.render("admin/pages/permission/index", {
        roles: roles,
        pageTitle: "Permission"
    });
}

// [PATCH] /admin/roles/update-permission
export const updatePermission = async (req: Request, res: Response): Promise<void> => {
    try {
        const adminId = res.locals.currentAdmin._id;
        const permissions = JSON.parse(req.body.permissions);
        for (const item of permissions) {
            await Role.updateOne(
                {
                    _id: item.id,
                    deleted: false
                },
                {
                    $set: {
                        permission: item.listPermission
                    },
                    $push: {
                        updatedBy: {
                            adminId: adminId,
                            action: "Phân quyền",
                            updatedAt: new Date()
                        }
                    }
                });
        }
        req.flash("success", "Cập nhật phân quyền thành công");
        res.redirect("back");
    } catch (error) {
        req.flash("fail", "Lỗi, hãy thử lại");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}