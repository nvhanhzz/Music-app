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
exports.patchChangePassword = exports.getChangePassword = exports.patchUpdateInfor = exports.getUpdateInfor = exports.getInformation = exports.patchResetPassword = exports.getResetPassword = exports.postVerifyOtp = exports.getVerifyOtp = exports.postForgotPassword = exports.getForgotPassword = exports.addFavoriteSong = exports.postLogout = exports.postLogin = exports.getLogin = exports.postRegister = exports.getRegister = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const hashPassword_1 = require("../../helper/hashPassword");
const generateToken_1 = __importDefault(require("../../helper/generateToken"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const status_enum_1 = __importDefault(require("../../enums/status.enum"));
const forgotPassword_model_1 = __importDefault(require("../../models/forgotPassword.model"));
const generate_1 = require("../../helper/generate");
const senMail_1 = require("../../helper/senMail");
const getRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('client/pages/user/register', {
        pageTitle: "Đăng ký"
    });
});
exports.getRegister = getRegister;
const postRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const TOKEN_EXP = parseInt(process.env.TOKEN_EXP, 10);
    const existUser = yield user_model_1.default.findOne({
        email: req.body.email
    });
    if (existUser) {
        req.flash('fail', 'Email đã tồn tại.');
        return res.redirect("back");
    }
    req.body.password = yield (0, hashPassword_1.hashPassword)(req.body.password);
    req.body.status = status_enum_1.default.ACTIVE;
    req.body.avatar = "";
    req.body.favoriteSong = [];
    const newUser = new user_model_1.default(req.body);
    yield newUser.save();
    (0, generateToken_1.default)(res, newUser.id, TOKEN_EXP, "token");
    req.flash("success", `Đăng ký thành công, xin chào ${newUser.fullName}.`);
    res.redirect(`/`);
});
exports.postRegister = postRegister;
const getLogin = (req, res) => {
    res.render('client/pages/user/login', {
        pageTitle: "Đăng nhập"
    });
};
exports.getLogin = getLogin;
const postLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const TOKEN_EXP = parseInt(process.env.TOKEN_EXP, 10);
    const user = yield user_model_1.default.findOne({
        email: req.body.email,
        deleted: false
    });
    if (!user) {
        req.flash("fail", "Email hoặc mật khẩu không chính xác.");
        return res.redirect("back");
    }
    const confirm = yield (0, hashPassword_1.comparePassword)(req.body.password, user.password.toString());
    if (!confirm) {
        req.flash("fail", "Email hoặc mật khẩu không chính xác.");
        return res.redirect("back");
    }
    if (user.status !== status_enum_1.default.ACTIVE) {
        req.flash("fail", "Tài khoản đã bị khóa.");
        return res.redirect("back");
    }
    (0, generateToken_1.default)(res, user.id, TOKEN_EXP, "token");
    req.flash("fail", `Đăng nhập thành công, xin chào ${user.fullName}.`);
    return res.redirect("/");
});
exports.postLogin = postLogin;
const postLogout = (req, res) => {
    res.clearCookie("token");
    req.flash("success", "Đăng xuất thành công.");
    return res.redirect("/");
};
exports.postLogout = postLogout;
const addFavoriteSong = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const songId = req.body.songId;
        const user = res.locals.currentUser;
        const song = yield song_model_1.default.findOne({
            _id: songId,
            deleted: false,
            status: status_enum_1.default.ACTIVE
        });
        if (!song) {
            return res.status(404).json({ message: "Song not found." });
        }
        const favoriteSongs = user.favoriteSong.map(item => item.songId.toString());
        if (favoriteSongs.includes(song._id.toString())) {
            user.favoriteSong = user.favoriteSong.filter(item => item.songId.toString() !== song._id.toString());
        }
        else {
            user.favoriteSong.push({ songId: song._id });
        }
        yield user.save();
        return res.status(200).json({ song: user });
    }
    catch (error) {
        return res.status(404).json({ message: "Song not found or user not found." });
    }
});
exports.addFavoriteSong = addFavoriteSong;
const getForgotPassword = (req, res) => {
    res.render("client/pages/user/forgotPassword", {
        pageTitle: "Quên mật khẩu"
    });
};
exports.getForgotPassword = getForgotPassword;
const postForgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const existUser = yield user_model_1.default.findOne({
        email: email,
        deleted: false,
        status: status_enum_1.default.ACTIVE
    });
    if (!existUser) {
        req.flash("fail", "Không tìm thấy email hoặc tài khoản đã bị khóa.");
        return res.redirect("back");
    }
    const existOtp = yield forgotPassword_model_1.default.findOne({
        email: email
    });
    if (existOtp) {
        req.flash("fail", "Đã gửi OTP đến email của bạn, vui lòng kiểm tra lại email.");
        return res.redirect("/user/password/verify-otp");
    }
    const otp = (0, generate_1.generateOTP)(8);
    const attemptsLeft = 5;
    const forgotPassword = new forgotPassword_model_1.default({
        email: email,
        otp: otp,
        attemptsLeft: attemptsLeft
    });
    const save = yield forgotPassword.save();
    if (!save) {
        req.flash("fail", "Đã có lỗi xảy ra, vui lòng thử lại.");
        return res.redirect("back");
    }
    const subject = `Mã OTP xác minh lấy lại mật khẩu`;
    const html = `Mã OTP là <b>${otp}</b>. Thời hạn sử dụng là 3 phút. Lưu ý không được để lộ mã này.`;
    (0, senMail_1.sendMail)(email, subject, html);
    const TEMP_TOKEN_EXP = parseInt(process.env.TEMP_TOKEN_EXP, 10);
    (0, generateToken_1.default)(res, existUser.id, TEMP_TOKEN_EXP, "verify_otp_token");
    req.flash("fail", "Đã gửi OTP đến email của bạn, vui lòng kiểm tra email.");
    return res.redirect("/user/password/verify-otp");
});
exports.postForgotPassword = postForgotPassword;
const getVerifyOtp = (req, res) => {
    if (!res.locals.userVerifyOtp) {
        return res.redirect("/");
    }
    const email = res.locals.userVerifyOtp.email;
    res.render("client/pages/user/verifyOtp", {
        pageTitle: "Xác thực mã OTP",
        email: email
    });
};
exports.getVerifyOtp = getVerifyOtp;
const postVerifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userVerifyOtp = res.locals.userVerifyOtp;
    const email = userVerifyOtp.email;
    const otp = req.body.otp;
    const forgotPassword = yield forgotPassword_model_1.default.findOne({
        email: email
    });
    if (!forgotPassword) {
        req.flash("fail", "Xác thực không thành công");
        return res.redirect("back");
    }
    if (forgotPassword.attemptsLeft === 0) {
        const del = yield forgotPassword_model_1.default.deleteOne({
            email: email
        });
        if (!del) {
            req.flash("fail", "Đã có lỗi xảy ra, vui lòng thử lại.");
            return res.redirect("back");
        }
        res.clearCookie("verify_otp_token");
        req.flash("fail", "Bạn đã nhập sai 5 lần, vui lòng lấy mã OTP mới và thử lại.");
        return res.redirect("/");
    }
    if (otp !== forgotPassword.otp) {
        forgotPassword.attemptsLeft -= 1;
        yield forgotPassword.save();
        req.flash("fail", "Mã OTP không chính xác.");
        return res.redirect("back");
    }
    const del = yield forgotPassword_model_1.default.deleteOne({
        email: email
    });
    if (!del) {
        req.flash("fail", "Đã có lỗi xảy ra, vui lòng thử lại.");
        return res.redirect("back");
    }
    res.clearCookie("verify_otp_token");
    const TEMP_TOKEN_EXP = parseInt(process.env.TEMP_TOKEN_EXP, 10);
    (0, generateToken_1.default)(res, userVerifyOtp.id, TEMP_TOKEN_EXP, "reset-password-token");
    req.flash("success", "Xác thực thành công, hãy đặt lại mật khẩu.");
    return res.redirect("/user/password/reset");
});
exports.postVerifyOtp = postVerifyOtp;
const getResetPassword = (req, res) => {
    if (!res.locals.userResetPassword) {
        return res.redirect("/");
    }
    res.render("client/pages/user/resetPassword", {
        pageTitle: "Đặt lại mật khẩu"
    });
};
exports.getResetPassword = getResetPassword;
const patchResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userResetPassword = res.locals.userResetPassword;
    const password = yield (0, hashPassword_1.hashPassword)(req.body.password);
    const reset = yield user_model_1.default.updateOne({
        _id: userResetPassword.id
    }, {
        password: password
    });
    if (!reset) {
        req.flash("fail", "Đã có lỗi xảy ra, vui lòng thử lại.");
        return res.redirect("back");
    }
    res.clearCookie("reset-password-token");
    const TOKEN_EXP = parseInt(process.env.TOKEN_EXP, 10);
    (0, generateToken_1.default)(res, userResetPassword.id, TOKEN_EXP, "token");
    req.flash("success", `Đặt lại mật khẩu thành công, xin chào ${userResetPassword.fullName}.`);
    res.redirect(`/`);
});
exports.patchResetPassword = patchResetPassword;
const getInformation = (req, res) => {
    res.render("client/pages/user/information", {
        pageTitle: "Thông tin cá nhân"
    });
};
exports.getInformation = getInformation;
const getUpdateInfor = (req, res) => {
    res.render("client/pages/user/updateInformation", {
        pageTitle: "Cập nhật thông tin"
    });
};
exports.getUpdateInfor = getUpdateInfor;
const patchUpdateInfor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.file) {
        req.body.avatar = req.body.file;
    }
    const result = yield user_model_1.default.updateOne({ _id: res.locals.currentUser._id }, req.body);
    if (!result) {
        req.flash("fail", "Cập nhật thất bại, vui lòng thử lại.");
        return res.redirect("back");
    }
    req.flash("success", "Cập nhật thông tin thành công.");
    return res.redirect("back");
});
exports.patchUpdateInfor = patchUpdateInfor;
const getChangePassword = (req, res) => {
    res.render("client/pages/user/changePassword", {
        pageTitle: "Đổi mật khẩu"
    });
};
exports.getChangePassword = getChangePassword;
const patchChangePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const password = req.body.password;
    const oldPassword = req.body.oldPassword;
    const user = yield user_model_1.default.findById(res.locals.currentUser._id);
    const isMatch = yield (0, hashPassword_1.comparePassword)(oldPassword, user.password);
    if (!isMatch) {
        req.flash("fail", "Mật khẩu không đúng !");
        return res.redirect("back");
    }
    if (password === oldPassword) {
        req.flash("fail", "Mật khẩu mới và mật khẩu cũ phải khác nhau.");
        res.redirect("back");
        return;
    }
    user.password = yield (0, hashPassword_1.hashPassword)(password);
    yield user.save();
    req.flash("success", `Đổi mật khẩu thành công.`);
    res.redirect(`/`);
});
exports.patchChangePassword = patchChangePassword;
