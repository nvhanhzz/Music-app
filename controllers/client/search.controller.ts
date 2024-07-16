import { Request, Response } from "express";
import Song from "../../models/song.model";
import searchHelper from "../../helper/search";
import ListStatus from "../../enums/status.enum";

// [GET] /search/:type
export const index = async (req: Request, res: Response): Promise<void | Response> => {
    const type = req.params.type;
    const query: any = req.query;
    const search = searchHelper(query);
    const keyword = search.keyword;
    const regex = search.regex;

    const songs = await Song.find({
        slug: regex,
        deleted: false,
        status: ListStatus.ACTIVE
    }).limit(5).populate("singerId", "fullName").sort({ "listenCount": "desc" });

    switch (type) {
        case "result":
            return res.render("client/pages/search/result", {
                pageTitle: "Kết quả tìm kiếm",
                keyword: keyword,
                songs: songs
            });

        case "suggest":
            return res.status(200).json({ songs: songs });

        default:
            break;
    }
}