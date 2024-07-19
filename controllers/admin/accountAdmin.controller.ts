import { Request, Response } from "express";
import Admin from "../../models/admin.model";
import ListStatus from "../../enums/status.enum";
import filterStatus from "../../helper/filterStatus";
import search from "../../helper/search";
import pagination from "../../helper/pagination";
import sort from "../../helper/sort";
import { Sort } from "../../enums/accountAdmin.enum";
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
            sortArray: sortArray
        });
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [PATCH] /admin/songs/change-status/:status/:id
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