import { Request, Response } from "express";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";

enum ListStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}

// [GET] /songs/:topicSlug
export const getSongByTopic = async (req: Request, res: Response): Promise<void> => {
    const topicSlug = req.params.topicSlug;
    const topic = await Topic.findOne({
        deleted: false,
        status: ListStatus.ACTIVE,
        slug: topicSlug
    });

    if (!topic) {
        res.redirect("/404-not-found");
        return;
    }

    const songs = await Song.find({
        deleted: false,
        status: ListStatus.ACTIVE,
        topicId: topic._id
    }).populate("singerId", "fullName").select("avatar title singerId like "); // sau thêm createdAt

    res.render("client/pages/song/songByTopic", {
        pageTitle: topic.title,
        songs: songs
    });
}