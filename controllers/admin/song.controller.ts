import { Request, Response } from "express";
import Song from "../../models/song.model";
import ListStatus from "../../enums/status.enum";
import filterStatus from "../../helper/filterStatus";
import search from "../../helper/search";
import pagination from "../../helper/pagination";
import sort from "../../helper/sort";

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