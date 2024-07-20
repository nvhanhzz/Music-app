import { Request, Response } from "express";
import User from "../../models/user.model";
import ListStatus from "../../enums/status.enum";
import filterStatus from "../../helper/filterStatus";
import search from "../../helper/search";
import pagination from "../../helper/pagination";
import sort from "../../helper/sort";
import { Sort } from "../../enums/accountUser.enum";
const PATH_ADMIN = process.env.PATH_ADMIN;

// [GET] /admin/account-user
export const index = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('view-user')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
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
    const total = await User.countDocuments(find);
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

    const users = await User.find(find)
        .skip(paginationObject.skip)
        .limit(paginationObject.limit)
        .sort(sortObject)
        .select("-password");

    res.render("admin/pages/accountUser/index", {
        pageTitle: "Quản lý tài khoản user",
        users: users,
        filterStatus: filter,
        keyword: searchObject.keyword,
        pagination: paginationObject,
        sortArray: sortArray,
        changeMultipleOptions: changeMultipleOptions
    });
}

// [GET] /admin/account-user/detail/:id
export const getUserDetail = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('view-user')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    try {
        const id = req.params.id;
        const user = await User.findOne({
            _id: id,
            deleted: false
        });
        if (!user) {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }
        return res.render("admin/pages/accountUser/detail", {
            pageTitle: "Chi tiết người dùng",
            user: user
        });

    } catch (error) {
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [PATCH] /admin/account-user/change-status/:status/:id
export const patchChangeStatus = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('update-user')) {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }

    const status = req.params.status;
    const itemId = req.params.id;

    if (!Object.values(ListStatus).includes(status as ListStatus)) {
        req.flash('fail', 'Cập nhật thất bại.');
        return;
    }

    try {
        const result = await User.updateOne(
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
}

// [DELETE] /admin/account-user/delete/:id
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('delete-user')) {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    const itemId = req.params.id;

    try {
        const result = await User.updateOne(
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

// [PATCH] /admin/account-user/change-multiple/:type
export const patchMultiple = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    const type = req.params.type;
    if ((type === "delete" && !permission.includes('delete-user')) || (type !== "delete" && !permission.includes('update-user'))) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }

    const ListItemChange = req.body.inputChangeMultiple.split(", ");
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

        default:
            break;
    }
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
        const update = await User.updateMany(
            {
                _id: { $in: ListItemChange },
            },
            upd
        );

        switch (type) {
            case 'active':
                req.flash('success', `Đã cập nhật trạng thái ${ListItemChange.length} tài khoản thành hoạt động.`);
                break;

            case 'inactive':
                req.flash('success', `Đã cập nhật trạng thái ${ListItemChange.length} tài khoản thành dừng hoạt động.`);
                break;

            case 'delete':
                req.flash('success', `Đã xóa ${ListItemChange.length} tài khoản.`);
                break;
        }

    } catch (error) {
        console.error(error);
        req.flash('fail', 'Lỗi!!!');
    }

    return res.redirect("back");
}

// [GET] /admin/songs/edit-history/:id
export const getEditHistory = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('view-user')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    try {
        const id = req.params.id;
        const user = await User.findOne({
            _id: id,
            deleted: false
        }).populate("updatedBy.adminId", "fullName");

        if (!user) {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }

        res.render('admin/pages/editHistory/index', {
            pageTitle: "Lịch sử cập nhật",
            item: user,
            type: "tài khoản"
        });

    } catch (e) {
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}