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
const role_model_1 = __importDefault(require("../../models/role.model"));
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const admin_model_1 = __importDefault(require("../../models/admin.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentAdmin = res.locals.currentAdmin;
    const permission = currentAdmin.roleId.permission;
    ;
    const song = {
        quantity: 0,
        active: 0,
        inactive: 0
    };
    if (permission.includes('view-song')) {
        song.quantity = yield song_model_1.default.countDocuments({});
        song.active = yield song_model_1.default.countDocuments({ status: "active" });
        song.inactive = song.quantity - song.active;
    }
    const topic = {
        quantity: 0,
        active: 0,
        inactive: 0
    };
    if (permission.includes('view-topic')) {
        topic.quantity = yield topic_model_1.default.countDocuments({});
        topic.active = yield topic_model_1.default.countDocuments({ status: "active" });
        topic.inactive = topic.quantity - topic.active;
    }
    const singer = {
        quantity: 0,
        active: 0,
        inactive: 0
    };
    if (permission.includes('view-singer')) {
        singer.quantity = yield singer_model_1.default.countDocuments({});
        singer.active = yield singer_model_1.default.countDocuments({ status: "active" });
        singer.inactive = singer.quantity - singer.active;
    }
    const admin = {
        quantity: 0,
        active: 0,
        inactive: 0
    };
    if (permission.includes('view-admin')) {
        admin.quantity = yield admin_model_1.default.countDocuments({});
        admin.active = yield admin_model_1.default.countDocuments({ status: "active" });
        admin.inactive = admin.quantity - admin.active;
    }
    const user = {
        quantity: 0,
        active: 0,
        inactive: 0
    };
    if (permission.includes('view-user')) {
        user.quantity = yield user_model_1.default.countDocuments({});
        user.active = yield user_model_1.default.countDocuments({ status: "active" });
        user.inactive = user.quantity - user.active;
    }
    const role = { quantity: 0 };
    if (permission.includes('view-role')) {
        role.quantity = yield role_model_1.default.countDocuments({ deleted: false });
    }
    res.render("admin/pages/dashboard/index", {
        pageTitle: "Tổng quan",
        currentAdmin: currentAdmin,
        singer: singer,
        topic: topic,
        song: song,
        admin: admin,
        user: user,
        role: role
    });
});
exports.index = index;
