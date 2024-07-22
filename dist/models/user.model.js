"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_slug_updater_1 = __importDefault(require("mongoose-slug-updater"));
mongoose_1.default.plugin(mongoose_slug_updater_1.default);
const userSchema = new mongoose_1.default.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    avatar: { type: String, required: true },
    slug: { type: String, slug: "fullName", unique: true },
    favoriteSong: [{
            songId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Song', required: true },
            addedAt: { type: Date, default: Date.now }
        }],
    status: { type: String, required: true },
    deleted: { type: Boolean, default: false },
    deletedBy: {
        adminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Admin" },
        deletedAt: Date
    },
    updatedBy: [
        {
            adminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Admin' },
            action: String,
            updatedAt: {
                type: Date
            }
        }
    ]
}, { timestamps: true });
const User = mongoose_1.default.model("User", userSchema, "users");
exports.default = User;
