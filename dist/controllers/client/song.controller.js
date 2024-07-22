"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.increaseListenCount = exports.getFavoriteSong = exports.patchLike = exports.getSongDetail = exports.getSongBySinger = exports.getSongByTopic = void 0;
const song_model_1 = __importDefault(require("../../models/song.model"));
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const status_enum_1 = __importDefault(require("../../enums/status.enum"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const getSongByTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const topicSlug = req.params.topicSlug;
    const topic = yield topic_model_1.default.findOne({
        deleted: false,
        status: status_enum_1.default.ACTIVE,
        slug: topicSlug
    });
    if (!topic) {
        res.redirect("/404-not-found");
        return;
    }
    const songs = yield song_model_1.default.find({
        deleted: false,
        status: status_enum_1.default.ACTIVE,
        topicId: topic._id
    })
        .sort({ position: "desc" })
        .populate("singerId", "fullName slug")
        .select("avatar title singerId like slug createdBy listenCount");
    res.render("client/pages/song/songByTopic", {
        pageTitle: topic.title,
        topic: topic,
        songs: songs
    });
});
exports.getSongByTopic = getSongByTopic;
const getSongBySinger = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const singerSlug = req.params.singerSlug;
    const singer = yield singer_model_1.default.findOne({
        deleted: false,
        status: status_enum_1.default.ACTIVE,
        slug: singerSlug
    });
    if (!singer) {
        res.redirect("/404-not-found");
        return;
    }
    const songs = yield song_model_1.default.find({
        deleted: false,
        status: status_enum_1.default.ACTIVE,
        singerId: singer._id
    })
        .sort({ position: "desc" })
        .populate("singerId", "fullName")
        .select("avatar title singerId like slug createdBy listenCount");
    singer["listenedCount"] = 0;
    for (const song of songs) {
        singer["listenedCount"] += song.listenCount;
    }
    res.render("client/pages/song/songBySinger", {
        pageTitle: singer.fullName,
        singer: singer,
        songs: songs
    });
});
exports.getSongBySinger = getSongBySinger;
const getSongDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const song = yield song_model_1.default.findOne({
        slug: slug,
        deleted: false,
        status: status_enum_1.default.ACTIVE
    })
        .populate("topicId", "title slug")
        .populate("singerId", "fullName slug");
    if (!song) {
        res.redirect("/404-not-found");
        return;
    }
    res.render("client/pages/song/detail", {
        pageTitle: song.title,
        song: song
    });
});
exports.getSongDetail = getSongDetail;
const patchLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const songId = req.body.songId;
        const userId = res.locals.currentUser.id;
        const song = yield song_model_1.default.findOne({
            _id: songId,
            deleted: false,
            status: status_enum_1.default.ACTIVE
        });
        if (!song) {
            return res.status(404).json({ message: "Song not found." });
        }
        let update;
        if (song.like.includes(userId)) {
            update = { $pull: { like: userId } };
        }
        else {
            update = { $push: { like: userId } };
        }
        const updatedSong = yield song_model_1.default.findByIdAndUpdate(songId, update, { new: true });
        return res.status(200).json({ song: updatedSong });
    }
    catch (error) {
        return res.status(404).json({ message: "Song not found or user not found." });
    }
});
exports.patchLike = patchLike;
const getFavoriteSong = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.currentUser;
    yield user.populate("favoriteSong.songId", "avatar title singerId like slug status deleted");
    yield user.populate("favoriteSong.songId.singerId", "fullName");
    user.favoriteSong.sort((a, b) => {
        const dateA = new Date(a.addedAt);
        const dateB = new Date(b.addedAt);
        return dateA.getTime() - dateB.getTime();
    });
    const songs = user.favoriteSong.filter(item => item.songId.deleted === false && item.songId.status === status_enum_1.default.ACTIVE);
    res.render("client/pages/song/favorite", {
        pageTitle: "Bài hát yêu thích",
        songs: songs
    });
});
exports.getFavoriteSong = getFavoriteSong;
const increaseListenCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const songId = req.body.songId;
    const song = yield song_model_1.default.findOne({
        _id: songId,
        deleted: false,
        status: status_enum_1.default.ACTIVE
    });
    if (!song) {
        return res.status(404).json({ message: "Song not found." });
    }
    if (!song.listenCount) {
        song.listenCount = 1;
    }
    else {
        ++song.listenCount;
    }
    yield song.save();
    return res.status(200).json({ listenCount: song.listenCount });
});
exports.increaseListenCount = increaseListenCount;
