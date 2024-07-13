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
    }).populate("singerId", "fullName").select("avatar title singerId like slug"); // sau thêm createdAt

    res.render("client/pages/song/songByTopic", {
        pageTitle: topic.title,
        songs: songs
    });
}

// [GET] /songs/detail/:slug
export const getSongDetail = async (req: Request, res: Response): Promise<void> => {
    const slug = req.params.slug;
    const song = await Song.findOne({
        slug: slug,
        deleted: false,
        status: ListStatus.ACTIVE
    })
        .populate("topicId", "title")
        .populate("singerId", "fullName");

    if (!song) {
        res.redirect("/404-not-found");
        return;
    }

    res.render("client/pages/song/detail", {
        pageTitle: song.title,
        song: song
    });
}