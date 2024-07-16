import { Request, Response } from "express";
import Song from "../../models/song.model";
import ListStatus from "../../enums/status.enum";
import filterStatus from "../../helper/filterStatus";
import search from "../../helper/search";
import pagination from "../../helper/pagination";
import sort from "../../helper/sort";
const PATH_ADMIN = process.env.PATH_ADMIN;

// [GET] /admin/songs/
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
    const total = await Song.countDocuments(find);
    const paginationObject = pagination(query, limit, total);
    //endpagination

    //sort
    const sortObject = sort(query);
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
        .select("title avatar singerId topicId status listenCount slug position");

    res.render("admin/pages/song/index", {
        pageTitle: "Quản lý bài hát",
        songs: songs,
        filterStatus: filter,
        keyword: searchObject.keyword,
        pagination: paginationObject,
        sortArray: sortArray
    });
}

// [PATCH] /admin/songs/change-status/:status/:id
export const patchChangeStatus = async (req: Request, res: Response): Promise<void> => {
    const status = req.params.status;
    const itemId = req.params.id;

    if (!Object.values(ListStatus).includes(status as ListStatus)) {
        req.flash('fail', 'Cập nhật thất bại.');
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
                // $push: {
                //     updatedBy: {
                //         accountId: res.locals.currentUser.id,
                //         updatedAt: new Date()
                //     }
                // }
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

// [DELETE] /admin/songs/delete/:id
export const deleteSong = async (req: Request, res: Response): Promise<void> => {
    const itemId = req.params.id;

    try {
        const result = await Song.updateOne(
            {
                _id: itemId,
                deleted: false
            },
            {
                $set: {
                    deleted: true
                },
                // $push: {
                //     updatedBy: {
                //         accountId: res.locals.currentUser.id,
                //         updatedAt: new Date()
                //     }
                // }
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

// [PATCH] /admin/songs/change-multiple/:type
export const patchMultiple = async (req: Request, res: Response): Promise<void> => {
    const type = req.params.type;
    const listSongChange = req.body.inputChangeMultiple.split(", ");
    // const accountId = res.locals.currentUser._id; // Assuming the current user's ID is stored in res.locals.currentUser._id

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
                            // $push: {
                            //     updatedBy: {
                            //         accountId: accountId,
                            //         updatedAt: new Date()
                            //     }
                            // }
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
            const update = await Song.updateMany(
                {
                    _id: { $in: listSongChange },
                },
                {
                    $set: updateObject,
                    // $push: {
                    //     updatedBy: {
                    //         accountId: accountId,
                    //         updatedAt: new Date()
                    //     }
                    // }
                }
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
}

// [GET] /admin/songs/:id
export const getSongDetail = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const song = await Song.findOne({
            _id: id,
            deleted: false
        })
            .populate("singerId", "fullName")
            .populate("topicId", "title");

        if (song) {
            // await logSupportHelper.createdBy(product);
            // if (product.categoryId) {
            //     const category = await ProductCategory.findOne({
            //         _id: product.categoryId,
            //         deleted: false
            //     });
            //     if (category) {
            //         product.category = category.title
            //     }
            // }

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
}