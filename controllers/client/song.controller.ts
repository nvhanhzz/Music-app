import { Request, Response } from "express";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";
import ListStatus from "../../enums/status.enum";

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

// [PATCH] /songs/like
export const patchLike = async (req: Request, res: Response): Promise<Response> => {
    try {
        const songId = req.body.songId;
        const userId = res.locals.currentUser.id;
        const song = await Song.findOne({
            _id: songId,
            deleted: false,
            status: ListStatus.ACTIVE
        });
        if (!song) {
            return res.status(404).json({ message: "Song not found." });
        }

        let update;
        if (song.like.includes(userId)) {
            update = { $pull: { like: userId } };
        } else {
            update = { $push: { like: userId } };
        }

        // Cập nhật bài hát
        const updatedSong = await Song.findByIdAndUpdate(songId, update, { new: true });
        return res.status(200).json({ song: updatedSong });

    } catch (error) {
        return res.status(404).json({ message: "Song not found or user not found." });
    }
}

// [GET] /songs/favorite
export const getFavoriteSong = async (req: Request, res: Response): Promise<void> => {
    const user = res.locals.currentUser;
    await user.populate("favoriteSong.songId", "avatar title singerId like slug status deleted");
    await user.populate("favoriteSong.songId.singerId", "fullName");
    user.favoriteSong.sort((a, b) => {
        const dateA = new Date(a.addedAt) as Date;
        const dateB = new Date(b.addedAt) as Date;
        return dateA.getTime() - dateB.getTime();
    });
    const songs = user.favoriteSong.filter(item => item.songId.deleted === false && item.songId.status === ListStatus.ACTIVE);

    res.render("client/pages/song/favorite", {
        pageTitle: "Bài hát yêu thích",
        songs: songs
    });
}

// [PATCH] /songs/increaseListenCount
export const increaseListenCount = async (req: Request, res: Response): Promise<Response> => {
    const songId = req.body.songId;
    const song = await Song.findOne({
        _id: songId,
        deleted: false,
        status: ListStatus.ACTIVE
    });
    if (!song) {
        return res.status(404).json({ message: "Song not found." });
    }
    if (!song.listenCount) { // trường hợp đổ data cứng vào db mà không có trường listenCount
        song.listenCount = 1;
    } else {
        ++song.listenCount;
    }

    await song.save();

    return res.status(200).json({ listenCount: song.listenCount });
}