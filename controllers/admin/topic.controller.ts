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
        { value: "featured", name: "Nổi bật" },
        { value: "unfeatured", name: "Không nổi bật" },
        { value: "change_position", name: "Thay đổi vị trí" },
        { value: "delete", name: "Xóa" },
    ]

    const topics = await Topic.find(find)
        .skip(paginationObject.skip)
        .limit(paginationObject.limit)
        .sort(sortObject)
        .populate("createdBy.adminId", "fullName")
        .select("title avatar status slug position featured");

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

// [PATCH] /admin/topics/change-featured/:featured/:id
export const patchChangeFeatured = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('update-song')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }

    const featured = req.params.featured === "true";
    const itemId = req.params.id;

    try {
        const result = await Topic.updateOne(
            {
                _id: itemId,
                deleted: false
            },
            {
                $set: {
                    featured: featured
                },
                $push: {
                    updatedBy: {
                        adminId: res.locals.currentAdmin.id,
                        action: `Thay đổi thành chủ đề ${featured ? '' : 'không '}nổi bật`,
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

// [DELETE] /admin/topics/delete/:id
export const deleteTopic = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('delete-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    const itemId = req.params.id;

    try {
        const result = await Topic.updateOne(
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

// [PATCH] /admin/topics/change-multiple/:type
export const patchMultiple = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    const type = req.params.type;
    if ((type === "delete" && !permission.includes('delete-topic')) || (type !== "delete" && !permission.includes('update-topic'))) {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }

    const listItemChange = req.body.inputChangeMultiple.split(", ");
    const adminId = res.locals.currentAdmin._id;

    const updateObject: {
        status?: string,
        featured?: boolean,
        deleted?: boolean
    } = {};
    switch (type) {
        case 'active':
            updateObject.status = 'active';
            break;

        case 'inactive':
            updateObject.status = 'inactive';
            break;

        case 'featured':
            updateObject.featured = true;
            break;

        case 'unfeatured':
            updateObject.featured = false;
            break;

        case 'delete':
            updateObject.deleted = true;
            break;

        case 'change_position':
            const listPosition = req.body.inputChangePosition.split(", ");
            let check = true;
            for (let i = 0; i < listItemChange.length; ++i) {
                try {
                    const result = await Topic.updateOne(
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
                req.flash('success', `Đã cập nhật vị trí của ${listItemChange.length} chủ đề.`);
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
                const action = `Thay đổi sang ${type}`;
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
            const update = await Topic.updateMany(
                {
                    _id: { $in: listItemChange },
                },
                upd
            );

            switch (type) {
                case 'active':
                    req.flash('success', `Đã cập nhật trạng thái ${listItemChange.length} chủ đề thành hoạt động.`);
                    break;

                case 'inactive':
                    req.flash('success', `Đã cập nhật ${listItemChange.length} chủ đề thành dừng hoạt động.`);
                    break;

                case 'featured':
                    req.flash('success', `Đã cập nhật ${listItemChange.length} chủ đề thành nổi bật.`);
                    break;

                case 'unfeatured':
                    req.flash('success', `Đã cập nhật ${listItemChange.length} chủ đề thành không nổi bật.`);
                    break;

                case 'delete':
                    req.flash('success', `Đã xóa ${listItemChange.length} chủ đề.`);
                    break;
            }

        } catch (error) {
            console.error(error);
            req.flash('fail', 'Lỗi!!!');
        }
    }

    res.redirect("back");
}

// [GET] /admin/topics/:id
export const getDetail = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('view-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }

    try {
        const id = req.params.id;
        const topic = await Topic.findOne({
            _id: id,
            deleted: false
        })
            .populate("createdBy.adminId", "fullName");

        if (topic) {
            res.render('admin/pages/topic/detail', {
                pageTitle: "Chi tiết chủ đề",
                topic: topic
            });
        } else {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }

    } catch (e) {
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}