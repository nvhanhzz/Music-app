import { Request, Response } from "express";
import ListStatus from "../../enums/status.enum";
import filterStatus from "../../helper/filterStatus";
import search from "../../helper/search";
import pagination from "../../helper/pagination";
import sort from "../../helper/sort";
import Topic from "../../models/topic.model";
import { Sort } from "../../enums/songs.enum";
const PATH_ADMIN = process.env.PATH_ADMIN;

// [GET] /admin/topics
export const index = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('view-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
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
    const total = await Topic.countDocuments(find);
    const paginationObject = pagination(query, limit, total);
    //endpagination

    //sort
    const sortObject = sort(query, Sort);
    const [sortKey, sortValue] = Object.entries(sortObject)[0];
    const sortArray = [
        { name: "Vị trí giảm dần", value: "position-desc", selected: `${sortKey}-${sortValue}` === "position-desc" },
        { name: "Vị trí tăng dần", value: "position-asc", selected: `${sortKey}-${sortValue}` === "position-asc" },
        { name: "Tên Z-A", value: "title-desc", selected: `${sortKey}-${sortValue}` === "title-desc" },
        { name: "Tên A-Z", value: "title-asc", selected: `${sortKey}-${sortValue}` === "title-asc" },
    ]
    //end sort

    const changeMultipleOptions = [
        { value: "active", name: "Hoạt động" },
        { value: "inactive", name: "Dừng hoạt động" },
        { value: "change_position", name: "Thay đổi vị trí" },
        { value: "delete", name: "Xóa" },
    ]

    const topics = await Topic.find(find)
        .skip(paginationObject.skip)
        .limit(paginationObject.limit)
        .sort(sortObject)
        .populate("createdBy.adminId", "fullName")
        .select("title avatar status slug position");

    res.render("admin/pages/topic/index", {
        pageTitle: "Quản lý chủ đề",
        topics: topics,
        filterStatus: filter,
        keyword: searchObject.keyword,
        pagination: paginationObject,
        sortArray: sortArray,
        changeMultipleOptions: changeMultipleOptions
    });
}

// [PATCH] /admin/topics/change-status/:status/:id
export const patchChangeStatus = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('update-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }

    const status = req.params.status;
    const itemId = req.params.id;

    if (!Object.values(ListStatus).includes(status as ListStatus)) {
        req.flash('fail', 'Cập nhật thất bại.');
        return;
    }

    try {
        const result = await Topic.updateOne(
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