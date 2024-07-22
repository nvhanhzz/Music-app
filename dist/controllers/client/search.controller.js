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
const search_1 = __importDefault(require("../../helper/search"));
const status_enum_1 = __importDefault(require("../../enums/status.enum"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.params.type;
    const query = req.query;
    const search = (0, search_1.default)(query);
    const keyword = search.keyword;
    const regex = search.regex;
    const songs = yield song_model_1.default.find({
        slug: regex,
        deleted: false,
        status: status_enum_1.default.ACTIVE
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
});
exports.index = index;
