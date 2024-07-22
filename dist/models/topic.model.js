"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_slug_updater_1 = __importDefault(require("mongoose-slug-updater"));
const admin_model_1 = __importDefault(require("./admin.model"));
mongoose_1.default.plugin(mongoose_slug_updater_1.default);
const topicSchema = new mongoose_1.default.Schema({
    title: String,
    avatar: String,
    description: String,
    status: String,
    position: Number,
    slug: { type: String, slug: "title", unique: true },
    featured: { type: Boolean, default: false },
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
const Topic = mongoose_1.default.model("Topic", topicSchema, "topics");
exports.default = Topic;
