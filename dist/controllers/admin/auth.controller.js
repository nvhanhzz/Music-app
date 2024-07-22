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
exports.postLogout = exports.postLogin = exports.getLogin = void 0;
const admin_model_1 = __importDefault(require("../../models/admin.model"));
const hashPassword_1 = require("../../helper/hashPassword");
const status_enum_1 = __importDefault(require("../../enums/status.enum"));
const generateToken_1 = __importDefault(require("../../helper/generateToken"));
const getLogin = (req, res) => {
    res.render('admin/pages/auth/login', {
        pageTitle: "Đăng nhập"
    });
};
exports.getLogin = getLogin;
const postLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield admin_model_1.default.findOne({
        email: req.body.email,
        deleted: false,
        status: status_enum_1.default.ACTIVE
    });
    if (!admin) {
        req.flash("fail", "Email hoặc mật khẩu không chính xác.");
        return res.redirect("back");
    }
    const confirm = yield (0, hashPassword_1.comparePassword)(req.body.password, admin.password.toString());
    if (!confirm) {
        req.flash("fail", "Email hoặc mật khẩu không chính xác.");
        return res.redirect("back");
    }
    const TOKEN_EXP = parseInt(process.env.TOKEN_EXP, 10);
    (0, generateToken_1.default)(res, admin.id, TOKEN_EXP, "tokenAdmin");
    const prefixAdmin = process.env.PATH_ADMIN;
    req.flash("fail", `Đăng nhập thành công, xin chào ${admin.fullName}.`);
    return res.redirect(`${prefixAdmin}/dashboard`);
});
exports.postLogin = postLogin;
const postLogout = (req, res) => {
    res.clearCookie("tokenAdmin");
    req.flash("success", "Đăng xuất thành công.");
    const prefixAdmin = process.env.PATH_ADMIN;
    return res.redirect(`${prefixAdmin}/auth/login`);
};
exports.postLogout = postLogout;
