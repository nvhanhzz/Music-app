"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const role_model_1 = __importDefault(require("./role.model"));
const mongoose_slug_updater_1 = __importDefault(require("mongoose-slug-updater"));
mongoose_1.default.plugin(mongoose_slug_updater_1.default);
const adminSchema = new mongoose_1.default.Schema({
    fullName: String,
    email: String,
    password: String,
    avatar: String,
    phone: String,
    status: String,
    roleId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: role_model_1.default },
    slug: { type: String, slug: "fullName", unique: true },
    deleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        adminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Admin' },
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
            adminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Admin' },
            action: String,
            updatedAt: {
                type: Date
            }
        }
    ]
});
const Admin = mongoose_1.default.model("Admin", adminSchema, "admins");
exports.default = Admin;
