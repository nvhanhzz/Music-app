import { Request, Response } from "express";
import User from "../../models/user.model";
import ListStatus from "../../enums/status.enum";
import filterStatus from "../../helper/filterStatus";
import search from "../../helper/search";
import pagination from "../../helper/pagination";
import sort from "../../helper/sort";
import { Sort } from "../../enums/accountAdmin.enum";
const PATH_ADMIN = process.env.PATH_ADMIN;

// [GET] /admin/account-user
export const index = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('view-user')) {
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
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [GET] /admin/detail/:id
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

// [PATCH] /admin/account-admin/change-status/:status/:id
export const patchChangeStatus = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('update-admin')) {
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