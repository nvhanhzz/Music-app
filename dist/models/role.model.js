"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_slug_updater_1 = __importDefault(require("mongoose-slug-updater"));
mongoose_1.default.plugin(mongoose_slug_updater_1.default);
const roleSchema = new mongoose_1.default.Schema({
    title: String,
    description: String,
    permission: {
        type: Array,
        default: []
    },
    slug: { type: String, slug: "title", unique: true },
    deleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        adminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Admin" },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    deletedBy: {
        adminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Admin" },
        deletedAt: Date
    },
    updatedBy: [
        {
            adminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Admin" },
            action: String,
            updatedAt: {
                type: Date
            }
        }
    ]
});
const Role = mongoose_1.default.model("Role", roleSchema, "roles");
exports.default = Role;
