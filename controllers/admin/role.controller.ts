import { Request, Response } from "express";
import Role from "../../models/role.model";
import filterStatus from "../../helper/filterStatus";
import search from "../../helper/search";
import pagination from "../../helper/pagination";
import sort from "../../helper/sort";
import { Sort } from "../../enums/role.enum";
const PATH_ADMIN = process.env.PATH_ADMIN;

// [GET] /admin/roles
export const index = async (req: Request, res: Response): Promise<void> => {
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
    if (searchObject && searchObject["regex"]) {
        find["slug"] = searchObject["regex"];
    }
    // end create find object

    //pagination
    const limit = 5;
    const total = await Role.countDocuments(find);
    const paginationObject = pagination(query, limit, total);
    //endpagination

    //sort
    const sortObject = sort(query, Sort);
    const [sortKey, sortValue] = Object.entries(sortObject)[0];
    const sortArray = [
        { name: "Tên Z-A", value: "title-desc", selected: `${sortKey}-${sortValue}` === "title-desc" },
        { name: "Tên A-Z", value: "title-asc", selected: `${sortKey}-${sortValue}` === "title-asc" },
    ]
    //end sort

    const changeMultipleOptions = [
        { value: "delete", name: "Xóa" },
    ]

    const roles = await Role.find(find)
        .skip(paginationObject.skip)
        .limit(paginationObject.limit)
        .sort(sortObject)
        .populate("createdBy.adminId", "fullName")
        .populate("updatedBy.adminId", "fullName");

    res.render("admin/pages/role/index", {
        pageTitle: "Quản lý nhóm quyền",
        roles: roles,
        filterStatus: filter,
        keyword: searchObject.keyword,
        pagination: paginationObject,
        sortArray: sortArray,
        changeMultipleOptions: changeMultipleOptions
    });
}

// [DELETE] /admin/roles/delete/:id
export const deleteRole = async (req: Request, res: Response): Promise<void> => {
    const itemId = req.params.id;
    try {
        const result = await Role.updateOne(
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
}

// [PATCH] /admin/roles/change-multiple/:type
export const patchMultiple = async (req: Request, res: Response): Promise<void> => {
    const listItemChange = req.body.inputChangeMultiple.split(", ");
    const adminId = res.locals.currentAdmin._id;

    const upd = {
        $set: {
            deleted: true,
            deletedBy: {
                adminId: res.locals.currentAdmin.id,
                deletedAt: new Date()
            }
        }
    }
    try {
        const update = await Role.updateMany(
            {
                _id: { $in: listItemChange },
            },
            upd
        );
        req.flash('success', `Đã xóa ${listItemChange.length} nhóm quyền.`);
    } catch (error) {
        console.error(error);
        req.flash('fail', 'Lỗi!!!');
    }
    res.redirect("back");
}

// [GET] /admin/roles/:id
export const getRoleDetail = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const role = await Role.findOne({
            _id: id,
            deleted: false
        }).populate("createdBy.adminId", "fullName");

        if (role) {
            res.render('admin/pages/role/detail', {
                pageTitle: "Chi tiết nhóm quyền",
                role: role
            });
        } else {
            res.redirect(`${PATH_ADMIN}/dashboard`);
        }

    } catch (e) {
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [GET] /admin/roles/create
export const getCreate = (req: Request, res: Response): void => {
    res.render("admin/pages/role/create", {
        pageTitle: "Tạo mới nhóm quyền"
    });
}

// [POST] /admin/roles/create
export const postCreate = async (req: Request, res: Response): Promise<void> => {
    try {
        const newRole = new Role({
            ...req.body,
            createdBy: {
                adminId: res.locals.currentAdmin.id
            }
        });
        const result = await newRole.save();
        if (result) {
            req.flash("success", "Tạo nhóm quyền thành công.");
            res.redirect("/admin/roles");
        } else {
            req.flash("fail", "Tạo nhóm quyền thất bại.");
            return res.redirect("back");
        }
    } catch (e) {
        req.flash("fail", "Tạo nhóm quyền thất bại.");
        return res.redirect("back");
    }
}

// [GET] /admin/roles/update/:id
export const getUpdate = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const role = await Role.findOne({
            _id: id,
            deleted: false
        });
        if (!role) {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }

        res.render("admin/pages/role/update", {
            pageTitle: "Cập nhật nhóm quyền",
            role: role
        });
    } catch (error) {
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [PATCH] /admin/roles/update/:id
export const patchUpdate = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const role = await Role.findOne({
            _id: id,
            deleted: false
        });
        let logUpdate = "";
        for (const key in req.body) {
            if (!role[key] || (role[key].toString() !== req.body[key].toString())) {
                logUpdate += key + " ";
            }
        }
        if (!logUpdate) {
            return res.redirect("back");
        }
        logUpdate = "Thay đổi " + logUpdate;

        const result = await Role.updateOne(
            {
                _id: id,
                deleted: false
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
        if (result) {
            req.flash("success", "Cập nhật nhóm quyền thành công.");
            res.redirect("back");
        } else {
            req.flash("fail", "Cập nhật nhóm quyền thất bại.");
            return res.redirect("back");
        }
    } catch (e) {
        req.flash("fail", "Cập nhật nhóm quyền thất bại.");
        return res.redirect("back");
    }
}

// [GET] /admin/roles/edit-history/:id
export const getEditHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const role = await Role.findOne({
            _id: id,
            deleted: false
        }).populate("updatedBy.adminId", "fullName");

        if (!role) {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }

        res.render('admin/pages/editHistory/index', {
            pageTitle: "Lịch sử cập nhật",
            item: role,
            type: "nhóm quyền"
        });

    } catch (e) {
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}