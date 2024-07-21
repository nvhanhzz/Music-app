import { Request, Response } from "express";
import ListStatus from "../../enums/status.enum";
import filterStatus from "../../helper/filterStatus";
import search from "../../helper/search";
import pagination from "../../helper/pagination";
import sort from "../../helper/sort";
import Singer from "../../models/singer.model";
import { Sort } from "../../enums/singer.enum";
import Song from "../../models/song.model";
const PATH_ADMIN = process.env.PATH_ADMIN;

// [GET] /admin/singers
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
    const total = await Singer.countDocuments(find);
    const paginationObject = pagination(query, limit, total);
    //endpagination

    //sort
    const sortObject = sort(query, Sort);
    const [sortKey, sortValue] = Object.entries(sortObject)[0];
    const sortArray = [
        { name: "Vị trí giảm dần", value: "position-desc", selected: `${sortKey}-${sortValue}` === "position-desc" },
        { name: "Vị trí tăng dần", value: "position-asc", selected: `${sortKey}-${sortValue}` === "position-asc" },
        { name: "Tên Z-A", value: "fullName-desc", selected: `${sortKey}-${sortValue}` === "fullName-desc" },
        { name: "Tên A-Z", value: "fullName-asc", selected: `${sortKey}-${sortValue}` === "fullName-asc" },
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

    const singers = await Singer.find(find)
        .skip(paginationObject.skip)
        .limit(paginationObject.limit)
        .sort(sortObject)
        .populate("createdBy.adminId", "fullName")
        .select("fullName avatar status slug position featured");

    for (const singer of singers) {
        const songs = await Song.find({
            singerId: singer._id,
            deleted: false,
            status: ListStatus.ACTIVE
        });
        singer["songCount"] = songs.length;
        singer["listenedCount"] = 0;
        for (const song of songs) {
            singer["listenedCount"] += song.listenCount;
        }
    }

    res.render("admin/pages/singer/index", {
        pageTitle: "Quản lý ca sĩ",
        singers: singers,
        filterStatus: filter,
        keyword: searchObject.keyword,
        pagination: paginationObject,
        sortArray: sortArray,
        changeMultipleOptions: changeMultipleOptions
    });
}

// [PATCH] /admin/singers/change-status/:status/:id
export const patchChangeStatus = async (req: Request, res: Response): Promise<void> => {
    const status = req.params.status;
    const itemId = req.params.id;

    if (!Object.values(ListStatus).includes(status as ListStatus)) {
        req.flash('fail', 'Cập nhật thất bại.');
        return;
    }

    try {
        const result = await Singer.updateOne(
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

// [PATCH] /admin/singers/change-featured/:featured/:id
export const patchChangeFeatured = async (req: Request, res: Response): Promise<void> => {
    const featured = req.params.featured === "true";
    const itemId = req.params.id;

    try {
        const result = await Singer.updateOne(
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
                        action: `Thay đổi thành ca sĩ ${featured ? '' : 'không '}nổi bật`,
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

// [DELETE] /admin/singers/delete/:id
export const deleteSinger = async (req: Request, res: Response): Promise<void> => {
    const itemId = req.params.id;

    try {
        const result = await Singer.updateOne(
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

// [PATCH] /admin/singers/change-multiple/:type
export const patchMultiple = async (req: Request, res: Response): Promise<void> => {
    const type = req.params.type;

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
                    const result = await Singer.updateOne(
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
                req.flash('success', `Đã cập nhật vị trí của ${listItemChange.length} ca sĩ.`);
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
            const update = await Singer.updateMany(
                {
                    _id: { $in: listItemChange },
                },
                upd
            );

            switch (type) {
                case 'active':
                    req.flash('success', `Đã cập nhật trạng thái ${listItemChange.length} ca sĩ thành hoạt động.`);
                    break;

                case 'inactive':
                    req.flash('success', `Đã cập nhật ${listItemChange.length} ca sĩ thành dừng hoạt động.`);
                    break;

                case 'featured':
                    req.flash('success', `Đã cập nhật ${listItemChange.length} ca sĩ thành nổi bật.`);
                    break;

                case 'unfeatured':
                    req.flash('success', `Đã cập nhật ${listItemChange.length} ca sĩ thành không nổi bật.`);
                    break;

                case 'delete':
                    req.flash('success', `Đã xóa ${listItemChange.length} ca sĩ.`);
                    break;
            }

        } catch (error) {
            console.error(error);
            req.flash('fail', 'Lỗi!!!');
        }
    }

    res.redirect("back");
}

// [GET] /admin/singers/:id
export const getDetail = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const singer = await Singer.findOne({
            _id: id,
            deleted: false
        })
            .populate("createdBy.adminId", "fullName");

        const songs = await Song.find({
            singerId: singer._id,
            deleted: false,
            status: ListStatus.ACTIVE
        });
        singer["songCount"] = songs.length;
        singer["listenedCount"] = 0;
        for (const song of songs) {
            singer["listenedCount"] += song.listenCount;
        }

        if (singer) {
            res.render('admin/pages/singer/detail', {
                pageTitle: "Chi tiết ca sĩ",
                singer: singer
            });
        } else {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }

    } catch (e) {
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [GET] /admin/singers/edit-history/:id
export const getEditHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const singer = await Singer.findOne({
            _id: id,
            deleted: false
        }).populate("updatedBy.adminId", "fullName");

        if (!singer) {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }

        res.render('admin/pages/editHistory/index', {
            pageTitle: "Lịch sử cập nhật",
            item: singer,
            type: "ca sĩ"
        });

    } catch (e) {
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [GET] /admin/singers/create
export const getCreate = async (req: Request, res: Response): Promise<void> => {
    const positionDefault = await Singer.countDocuments({
        deleted: false
    }) + 1;

    res.render("admin/pages/singer/create", {
        pageTitle: "Tạo mới ca sĩ",
        positionDefault: positionDefault
    });
}

// [POST] /admin/singers/create
export const postCreate = async (req: Request, res: Response): Promise<void> => {
    try {
        req.body.position = parseInt(req.body.position);
        if (req.body.file) {
            req.body.avatar = req.body.file;
        }
        if (!Number.isInteger(req.body.position)) {
            const positionDefault = await Singer.countDocuments({
                deleted: false
            }) + 1;
            req.body.position = positionDefault;
        }

        const newSinger = new Singer({
            ...req.body,
            createdBy: {
                adminId: res.locals.currentAdmin.id
            }
        });
        const result = await newSinger.save();
        if (result) {
            req.flash("success", "Tạo ca sĩ thành công.");
            return res.redirect("/admin/singers");
        } else {
            req.flash("fail", "Tạo ca sĩ thất bại.");
            return res.redirect("back");
        }
    } catch (e) {
        req.flash("fail", "Tạo ca sĩ thất bại.");
        return res.redirect("back");
    }
}

// [GET] /admin/singers/update/:id
export const getUpdate = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const singer = await Singer.findOne({
            _id: id,
            deleted: false
        });

        return res.render("admin/pages/singer/update", {
            pageTitle: "Cập nhật ca sĩ",
            singer: singer
        });

    } catch (error) {
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [PATCH] /admin/singers/update/:id
export const patchUpdate = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.body.file) {
            req.body.avatar = req.body.file;
        }
        const id = req.params.id;
        const singer = await Singer.findOne({
            _id: id,
            deleted: false
        });
        let logUpdate = "";
        for (const key in req.body) {
            if (!singer[key] || (singer[key].toString() !== req.body[key].toString())) {
                logUpdate += key + " ";
            }
        }
        if (!logUpdate) {
            return res.redirect("back");
        }
        logUpdate = "Thay đổi " + logUpdate;

        const result = await Singer.updateOne(
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
            req.flash("success", "Cập nhật ca sĩ thành công.");
            res.redirect("back");
        } else {
            req.flash("fail", "Cập nhật ca sĩ thất bại.");
            return res.redirect("back");
        }
    } catch (e) {
        req.flash("fail", "Cập nhật ca sĩ thất bại.");
        return res.redirect("back");
    }
}