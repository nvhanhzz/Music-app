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

// [DELETE] /admin/songs/delete/:id
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

// [PATCH] /admin/songs/change-multiple/:type
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