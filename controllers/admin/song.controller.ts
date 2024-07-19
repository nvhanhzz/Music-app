import { Request, Response } from "express";
import Song from "../../models/song.model";
import ListStatus from "../../enums/status.enum";
import filterStatus from "../../helper/filterStatus";
import search from "../../helper/search";
import pagination from "../../helper/pagination";
import sort from "../../helper/sort";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";
import { Sort } from "../../enums/songs.enum";
const PATH_ADMIN = process.env.PATH_ADMIN;

// [GET] /admin/songs
export const index = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('view-song')) {
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
        const total = await Song.countDocuments(find);
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
            { name: "Lượt nghe giảm dần", value: "listenCount-desc", selected: `${sortKey}-${sortValue}` === "listenCount-desc" },
            { name: "Lượt nghe tăng dần", value: "listenCount-asc", selected: `${sortKey}-${sortValue}` === "listenCount-asc" },
        ]
        //end sort

        const songs = await Song.find(find)
            .skip(paginationObject.skip)
            .limit(paginationObject.limit)
            .sort(sortObject)
            .populate("singerId", "fullName")
            .populate("topicId", "title")
            .populate("createdBy.adminId", "fullName")
            .select("title avatar singerId topicId status listenCount slug position featured");

        res.render("admin/pages/song/index", {
            pageTitle: "Quản lý bài hát",
            songs: songs,
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
    if (permission.includes('update-song')) {
        const status = req.params.status;
        const itemId = req.params.id;

        if (!Object.values(ListStatus).includes(status as ListStatus)) {
            req.flash('fail', 'Cập nhật thất bại.');
            return;
        }

        try {
            const result = await Song.updateOne(
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

// [PATCH] /admin/songs/change-featured/:featured/:id
export const patchChangeFeatured = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('update-song')) {
        const featured = req.params.featured === "true";
        const itemId = req.params.id;

        try {
            const result = await Song.updateOne(
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
                            action: `Thay đổi thành bài hát ${featured ? '' : 'không '}nổi bật`,
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
export const deleteSong = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('delete-song')) {
        const itemId = req.params.id;

        try {
            const result = await Song.updateOne(
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
    if (permission.includes('update-song')) {
        const type = req.params.type;
        const listSongChange = req.body.inputChangeMultiple.split(", ");
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
                for (let i = 0; i < listSongChange.length; ++i) {
                    try {
                        const result = await Song.updateOne(
                            { _id: listSongChange[i] },
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
                        console.error(`Error updating product ${listSongChange[i]}:`, error);
                    }
                }
                if (check) {
                    req.flash('success', `Đã cập nhật vị trí của ${listSongChange.length} bài hát.`);
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
                const update = await Song.updateMany(
                    {
                        _id: { $in: listSongChange },
                    },
                    upd
                );

                switch (type) {
                    case 'active':
                        req.flash('success', `Đã cập nhật trạng thái ${listSongChange.length} bài hát thành hoạt động.`);
                        break;

                    case 'inactive':
                        req.flash('success', `Đã cập nhật trạng thái ${listSongChange.length} bài hát thành dừng hoạt động.`);
                        break;

                    case 'delete':
                        req.flash('success', `Đã xóa ${listSongChange.length} bài hát.`);
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

// [GET] /admin/songs/:id
export const getSongDetail = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('view-song')) {
        try {
            const id = req.params.id;
            const song = await Song.findOne({
                _id: id,
                deleted: false
            })
                .populate("singerId", "fullName")
                .populate("topicId", "title")
                .populate("createdBy.adminId", "fullName");

            if (song) {
                res.render('admin/pages/song/detail', {
                    pageTitle: "Chi tiết bài hát",
                    song: song
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

// [GET] /admin/songs/create
export const getCreate = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('create-song')) {
        const topics = await Topic.find({
            deleted: false,
            status: ListStatus.ACTIVE
        }).populate("title");

        const singers = await Singer.find({
            deleted: false,
            status: ListStatus.ACTIVE
        }).populate("fullName");

        const positionDefault = await Song.countDocuments({
            deleted: false
        }) + 1;

        res.render("admin/pages/song/create", {
            pageTitle: "Tạo mới bài hát",
            topics: topics,
            singers: singers,
            positionDefault: positionDefault
        });
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [POST] /admin/songs/create
export const postCreate = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('create-song')) {
        try {
            req.body.position = parseInt(req.body.position);
            if (!Number.isInteger(req.body.position)) {
                const positionDefault = await Song.countDocuments({
                    deleted: false
                }) + 1;
                req.body.position = positionDefault;
            }

            const newSong = new Song({
                ...req.body,
                createdBy: {
                    adminId: res.locals.currentAdmin.id
                }
            });
            const result = await newSong.save();
            if (result) {
                req.flash("success", "Tạo bài hát thành công.");
                res.redirect("/admin/songs");
            } else {
                req.flash("fail", "Tạo bài hát thất bại.");
                return res.redirect("back");
            }
        } catch (e) {
            req.flash("fail", "Tạo bài hát thất bại.");
            return res.redirect("back");
        }
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [GET] /admin/songs/update/:id
export const getUpdate = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('update-song')) {
        try {
            const id = req.params.id;
            const song = await Song.findOne({
                _id: id,
                deleted: false
            });

            if (!song) {
                return res.redirect("back");
            }

            const topics = await Topic.find({
                deleted: false,
                status: ListStatus.ACTIVE
            }).populate("title");

            const singers = await Singer.find({
                deleted: false,
                status: ListStatus.ACTIVE
            }).populate("fullName");

            res.render("admin/pages/song/update", {
                pageTitle: "Cập nhật bài hát",
                song: song,
                topics: topics,
                singers: singers
            });
        } catch (e) {
            return res.redirect("back");
        }
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [PATCH] /admin/songs/update/:id
export const patchUpdate = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('update-song')) {
        try {
            const id = req.params.id;
            const song = await Song.findOne({
                _id: id,
                deleted: false
            });
            let logUpdate = "Thay đổi ";
            for (const key in req.body) {
                if (song[key].toString() !== req.body[key].toString()) {
                    logUpdate += key + " ";
                }
            }

            const result = await Song.updateOne(
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
                req.flash("success", "Cập nhật bài hát thành công.");
                res.redirect("back");
            } else {
                req.flash("fail", "Cập nhật bài hát thất bại.");
                return res.redirect("back");
            }
        } catch (e) {
            console.log(e);
            req.flash("fail", "Cập nhật bài hát thất bại.");
            return res.redirect("back");
        }
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}

// [GET] /admin/songs/edit-history/:id
export const getEditHistory = async (req: Request, res: Response): Promise<void> => {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (permission.includes('view-song')) {
        try {
            const id = req.params.id;
            const song = await Song.findOne({
                _id: id,
                deleted: false
            }).populate("updatedBy.adminId", "fullName");

            if (!song) {
                return res.redirect(`${PATH_ADMIN}/dashboard`);
            }

            res.render('admin/pages/editHistory/index', {
                pageTitle: "Lịch sử cập nhật",
                item: song,
                type: "bài hát"
            });

        } catch (e) {
            res.redirect(`${PATH_ADMIN}/dashboard`);
        }
    } else {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
}