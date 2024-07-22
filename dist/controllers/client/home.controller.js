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
exports.index = void 0;
const song_model_1 = __importDefault(require("../../models/song.model"));
const status_enum_1 = __importDefault(require("../../enums/status.enum"));
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const songs = yield song_model_1.default.find({
        deleted: false,
        status: status_enum_1.default.ACTIVE
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
    const featuredTopics = yield topic_model_1.default.find({
        deleted: false,
        status: status_enum_1.default.ACTIVE,
        featured: true
    })
        .sort({ "position": "desc" })
        .limit(4);
    const featuredSingers = yield singer_model_1.default.find({
        deleted: false,
        status: status_enum_1.default.ACTIVE,
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
});
exports.index = index;
