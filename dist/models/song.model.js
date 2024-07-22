"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_slug_updater_1 = __importDefault(require("mongoose-slug-updater"));
const singer_model_1 = __importDefault(require("./singer.model"));
const topic_model_1 = __importDefault(require("./topic.model"));
const user_model_1 = __importDefault(require("./user.model"));
const admin_model_1 = __importDefault(require("./admin.model"));
mongoose_1.default.plugin(mongoose_slug_updater_1.default);
const songSchema = new mongoose_1.default.Schema({
    title: { type: String },
    avatar: { type: String },
    description: { type: String },
    singerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: singer_model_1.default },
    topicId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: topic_model_1.default },
    like: { type: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: user_model_1.default }] },
    lyrics: { type: String },
    audio: { type: String },
    listenCount: { type: Number },
    position: { type: Number },
    featured: { type: Boolean },
    status: { type: String },
    slug: { type: String, slug: "title", unique: true },
    deleted: { type: Boolean, default: false },
    deletedBy: { adminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: admin_model_1.default }, deletedAt: Date },
    createdBy: {
        adminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: admin_model_1.default },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    updatedBy: [
        {
            adminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: admin_model_1.default },
            action: String,
            updatedAt: {
                type: Date
            }
        }
    ]
});
const Song = mongoose_1.default.model("Song", songSchema, "songs");
exports.default = Song;
