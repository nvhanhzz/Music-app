import { Request, Response } from "express";
import Admin from "../../models/admin.model";
import ListStatus from "../../enums/status.enum";
import filterStatus from "../../helper/filterStatus";
import search from "../../helper/search";
import pagination from "../../helper/pagination";
import sort from "../../helper/sort";
import { Sort } from "../../enums/accountAdmin.enum";
import Role from "../../models/role.model";
import { comparePassword, hashPassword } from "../../helper/hashPassword";
const PATH_ADMIN = process.env.PATH_ADMIN;

// [GET] /admin/account-admin
export const index = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('view-admin')) {
        const query = req.query;

        // filter
        const filter = filterStatus(query);
        // end filter

        // search
        let searchObject = {
            keyword: ""
        };
        if (query.keyword) {
            interface SearchQuery {
                keyword: string;
            }
            searchObject = search(query as unknown as SearchQuery);
        }
        // end search

        // create find object
        const find = {
            deleted: false
        };
        const status = query.status;
        if (Object.values(ListStatus).includes(status as ListStatus)) {
            find["status"] = status;
        }
        if (searchObject && searchObject["regex"]) {
            find["slug"] = searchObject["regex"];
        }
        // end create find object

        //pagination
        const limit = 5;
        const total = await Admin.countDocuments(find);
        const paginationObject = pagination(query, limit, total);
        //endpagination

        //sort
        const sortObject = sort(query, Sort);
        const [sortKey, sortValue] = Object.entries(sortObject)[0];
        const sortArray = [
            { name: "Tên Z-A", value: "fullName-desc", selected: `${sortKey}-${sortValue}` === "fullName-desc" },
            { name: "Tên A-Z", value: "fullName-asc", selected: `${sortKey}-${sortValue}` === "fullName-asc" },
        ]
        //end sort

        const changeMultipleOptions = [
            { value: "active", name: "Hoạt động" },
            { value: "inactive", name: "Dừng hoạt động" },
            { value: "delete", name: "Xóa" },
        ]

        const admins = await Admin.find(find)
            .skip(paginationObject.skip)
            .limit(paginationObject.limit)
            .sort(sortObject)
            .populate("roleId", "title")
            .populate("createdBy.adminId", "fullName")
            .select("-password");

        res.render("admin/pages/accountAdmin/index", {
            pageTitle: "Quản lý tài khoản admin",
            admins: admins,
            filterStatus: filter,
            keyword: searchObject.keyword,
            pagination: paginationObject,
            sortArray: sortArray,
            changeMultipleOptions: changeMultipleOptions
        });
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [PATCH] /admin/account-admin/change-status/:status/:id
export const patchChangeStatus = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('update-admin')) {
        const status = req.params.status;
        const itemId = req.params.id;

        if (!Object.values(ListStatus).includes(status as ListStatus)) {
            req.flash('fail', 'Cập nhật thất bại.');
            return;
        }

        try {
            const result = await Admin.updateOne(
                {
                    _id: itemId,
                    deleted: false
                },
                {
                    $set: {
                        status: status
                    },
                    $push: {
                        updatedBy: {
                            adminId: res.locals.currentAdmin.id,
                            action: `Thay đổi trạng thái sang ${status}`,
                            updatedAt: new Date()
                        }
                    }
                }
            );
            if (result.modifiedCount === 1) {
                req.flash('success', 'Cập nhật thành công.');
            } else {
                req.flash('fail', 'Cập nhật thất bại.');
            }
        } catch (error) {
            req.flash('fail', 'Cập nhật thất bại.');
        }

        res.redirect("back");
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [DELETE] /admin/account-admin/delete/:id
export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('delete-admin')) {
        const itemId = req.params.id;

        try {
            const result = await Admin.updateOne(
                {
                    _id: itemId,
                    deleted: false
                },
                {
                    $set: {
                        deleted: true,
                        deletedBy: {
                            adminId: res.locals.currentAdmin.id,
                            deletedAt: new Date()
                        }
                    }
                }
            );
            if (result.modifiedCount === 1) {
                req.flash('success', 'Xóa thành công.');
            } else {
                req.flash('fail', 'Xóa thất bại.');
            }
        } catch (error) {
            req.flash('fail', 'Xóa thất bại.');
        }

        res.redirect("back");
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [PATCH] /admin/account-admin/change-multiple/:type
export const patchMultiple = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    const type = req.params.type;
    if ((type === "delete" && permission.includes('delete-admin')) || (type !== "delete" && permission.includes('update-admin'))) {
        const listItemChange = req.body.inputChangeMultiple.split(", ");
        const adminId = res.locals.currentAdmin._id;

        const updateObject: {
            status?: string,
            deleted?: boolean
        } = {};
        switch (type) {
            case 'active':
                updateObject.status = 'active';
                break;

            case 'inactive':
                updateObject.status = 'inactive';
                break;

            case 'delete':
                updateObject.deleted = true;
                break;

            case 'change_position':
                const listPosition = req.body.inputChangePosition.split(", ");
                let check = true;
                for (let i = 0; i < listItemChange.length; ++i) {
                    try {
                        const result = await Admin.updateOne(
                            { _id: listItemChange[i] },
                            {
                                $set: { position: parseInt(listPosition[i]) },
                                $push: {
                                    updatedBy: {
                                        adminId: adminId,
                                        action: "Thay đổi vị trí",
                                        updatedAt: new Date()
                                    }
                                }
                            }
                        );
                    } catch (error) {
                        check = false;
                        console.error(`Error updating product ${listItemChange[i]}:`, error);
                    }
                }
                if (check) {
                    req.flash('success', `Đã cập nhật vị trí của ${listItemChange.length} tài khoản admin.`);
                }
                res.redirect("back");
                return;

            default:
                break;
        }

        if (type !== "change_position") {
            try {
                let upd = {};
                if (type !== "delete") {
                    const action = `Thay đổi trạng thái sang ${type}`;
                    upd = {
                        $set: updateObject,
                        $push: {
                            updatedBy: {
                                adminId: adminId,
                                action: action,
                                updatedAt: new Date()
                            }
                        }
                    }
                } else {
                    upd = {
                        $set: {
                            deleted: true,
                            deletedBy: {
                                adminId: res.locals.currentAdmin.id,
                                deletedAt: new Date()
                            }
                        }
                    }
                }
                const update = await Admin.updateMany(
                    {
                        _id: { $in: listItemChange },
                    },
                    upd
                );

                switch (type) {
                    case 'active':
                        req.flash('success', `Đã cập nhật trạng thái ${listItemChange.length} tài khoản admin thành hoạt động.`);
                        break;

                    case 'inactive':
                        req.flash('success', `Đã cập nhật trạng thái ${listItemChange.length} tài khoản admin thành dừng hoạt động.`);
                        break;

                    case 'delete':
                        req.flash('success', `Đã xóa ${listItemChange.length} tài khoản admin.`);
                        break;
                }

            } catch (error) {
                console.error(error);
                req.flash('fail', 'Lỗi!!!');
            }
        }

        res.redirect("back");
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [GET] /admin/account-admin/:id
export const getAdminDetail = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('view-admin')) {
        try {
            const id = req.params.id;
            const admin = await Admin.findOne({
                _id: id,
                deleted: false
            })
                .populate("roleId", "title")
                .populate("createdBy.adminId", "fullName");

            if (admin) {
                res.render('admin/pages/accountAdmin/detail', {
                    pageTitle: "Chi tiết bài hát",
                    admin: admin
                });
            } else {
                res.redirect(`${PATH_ADMIN}/dashboard`);
            }

        } catch (e) {
            res.redirect(`${PATH_ADMIN}/dashboard`);
        }
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [GET] /admin/account-admin/create
export const getCreate = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('create-admin')) {
        const roles = await Role.find({
            deleted: false,
        }).populate("title");

        res.render("admin/pages/accountAdmin/create", {
            pageTitle: "Tạo mới tài khoản admin",
            roles: roles,
        });
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [POST] /admin/account-admin/create
export const postCreate = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('create-admin')) {
        const accountExist = await Admin.findOne({
            email: req.body.email
        });
        if (accountExist) {
            req.flash('fail', 'Email đã tồn tại trong hệ thống.');
            return res.redirect("back");
        }
        if (req.body.file) {
            req.body.avatar = req.body.file;
        }

        req.body.createdBy = {
            adminId: res.locals.currentAdmin.id
        };

        req.body.password = await hashPassword(req.body.password);

        const admin = new Admin(req.body);

        try {
            await admin.save();
            req.flash('success', 'Tạo tài khoản admin thành công');
        } catch (error) {
            console.error(error);
        }

        return res.redirect(`${PATH_ADMIN}/account-admin`);
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }

}

// [GET] /admin/account-admin/update/:id
export const getUpdate = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('update-admin')) {
        const id = req.params.id;
        const admin = await Admin.findOne({
            _id: id,
            deleted: false
        });
        const roles = await Role.find({
            deleted: false,
        }).populate("title");

        res.render("admin/pages/accountAdmin/update", {
            pageTitle: "Cập nhật tài khoản admin",
            admin: admin,
            roles: roles
        });
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [PATCH] /admin/account-admin/update/:id
export const patchUpdate = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('update-admin')) {
        const id = req.params.id;
        const admin = await Admin.findOne({
            _id: id,
            deleted: false
        });
        if (!admin) {
            return res.redirect("back");
        }

        const accountExist = await Admin.findOne({
            email: req.body.email
        });
        if (accountExist && accountExist.id !== id) {
            req.flash('fail', 'Email đã tồn tại trong hệ thống.');
            return res.redirect("back");
        }
        if (req.body.file) {
            req.body.avatar = req.body.file;
        }

        if (req.body.password) {
            req.body.password = await hashPassword(req.body.password);
        }

        let logUpdate = "";
        for (const key in req.body) {
            if (!admin[key] || (admin[key].toString() !== req.body[key].toString())) {
                logUpdate += key + " ";
            }
        }
        if (!logUpdate) {
            return res.redirect("back");
        }
        logUpdate = "Thay đổi " + logUpdate;

        try {
            await Admin.updateOne(
                {
                    _id: id
                },
                {
                    $set: req.body,
                    $push: {
                        updatedBy: {
                            adminId: res.locals.currentAdmin.id,
                            action: logUpdate,
                            updatedAt: new Date()
                        }
                    }
                }
            );
            req.flash('success', 'Cập nhật thành công');
        } catch (error) {
            req.flash("fail", "Cập nhật thất bại.");
        }

        return res.redirect("back");
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [GET] /admin/account-admin/edit-history/:id
export const getEditHistory = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('view-admin')) {
        try {
            const id = req.params.id;
            const admin = await Admin.findOne({
                _id: id,
                deleted: false
            }).populate("updatedBy.adminId", "fullName");

            if (!admin) {
                return res.redirect(`${PATH_ADMIN}/dashboard`);
            }

            res.render('admin/pages/editHistory/index', {
                pageTitle: "Lịch sử cập nhật",
                item: admin,
                type: "tài khoản admin"
            });

        } catch (e) {
            res.redirect(`${PATH_ADMIN}/dashboard`);
        }
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}