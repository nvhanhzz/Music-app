import { Request, Response } from "express";
import Song from "../../models/song.model";
import ListStatus from "../../enums/status.enum";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";

export const index = async (req: Request, res: Response): Promise<void> => {
    const songs = await Song.find({
        deleted: false,
        status: ListStatus.ACTIVE
    })
        .populate("singerId", "fullName slug")
        .sort({ "createdBy.createdAt": "desc" })
        .select("title avatar singerId createdBy.createdAt slug listenCount like featured position");

    const featuredSongs = songs
        .filter(item => item.featured)
        .sort((a, b) => b.position - a.position)
        .slice(0, 3);

    const topListenedSongs = songs
        .filter(item => item.featured)
        .sort((a, b) => b.listenCount - a.listenCount)
        .slice(0, 3);

    const topLikedSongs = songs
        .filter(item => item.featured)
        .sort((a, b) => b.like.length - a.like.length)
        .slice(0, 3);

    const featuredTopics = await Topic.find({
        deleted: false,
        status: ListStatus.ACTIVE,
        featured: true
    })
        .sort({ "position": "desc" })
        .limit(4);

    const featuredSingers = await Singer.find({
        deleted: false,
        status: ListStatus.ACTIVE,
        featured: true
    })
        .sort({ "position": "desc" })
        .limit(4);


    res.render("client/pages/home/index", {
        pageTitle: res.locals.generalSetting.websiteName,
        featuredSongs: featuredSongs,
        topListenedSongs: topListenedSongs,
        topLikedSongs: topLikedSongs,
        featuredTopics: featuredTopics,
        featuredSingers: featuredSingers
    });
}