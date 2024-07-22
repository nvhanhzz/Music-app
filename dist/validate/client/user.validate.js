"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateInfor = exports.addFavoriteSong = exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.validatePostRegister = void 0;
const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&]{6,}$/;
const validatePostRegister = (req, res, next) => {
    if (!req.body.fullName) {
        req.flash('fail', 'Vui lòng điền vào trường họ và tên.');
        return res.redirect("back");
    }
    if (!req.body.phone) {
        req.flash('fail', 'Vui lòng điền vào trường số điện thoại.');
        return res.redirect("back");
    }
    if (!req.body.email) {
        req.flash('fail', 'Vui lòng điền vào trường email.');
        return res.redirect("back");
    }
    if (!req.body.password) {
        req.flash('fail', 'Vui lòng điền vào trường mật khẩu.');
        return res.redirect("back");
    }
    if (!req.body.confirmPassword) {
        req.flash('fail', 'Vui lòng điền vào trường xác nhận mật khẩu.');
        return res.redirect("back");
    }
    if (req.body.password !== req.body.confirmPassword) {
        req.flash('fail', 'Mật khẩu và xác nhận mật khẩu không khớp.');
        return res.redirect("back");
    }
    if (!regex.test(req.body.password)) {
        req.flash('fail', 'Mật khẩu phải dài ít nhất 6 ký tự, bao gồm ít nhất một chữ cái in hoa, một chữ cái thường, một số và một ký tự đặc biệt (@, $, !, %, *, ?, &, #).');
        return res.redirect("back");
    }
    next();
};
exports.validatePostRegister = validatePostRegister;
const forgotPassword = (req, res, next) => {
    if (!req.body.email) {
        req.flash("fail", "Không được để trống email");
        return res.redirect("back");
    }
    next();
};
exports.forgotPassword = forgotPassword;
const verifyOtp = (req, res, next) => {
    if (!res.locals.userVerifyOtp) {
        return res.redirect("back");
    }
    if (!req.body.otp) {
        req.flash("fail", "Không được để trống OTP");
        return res.redirect("back");
    }
    next();
};
exports.verifyOtp = verifyOtp;
const resetPassword = (req, res, next) => {
    if (!res.locals.userResetPassword) {
        return res.redirect("back");
    }
    if (!req.body.password) {
        req.flash('fail', 'Mật khẩu không được để trống.');
        return res.redirect("back");
    }
    if (!req.body.confirmPassword) {
        req.flash('fail', 'Xác nhận mật khẩu không được để trống.');
        return res.redirect("back");
    }
    if (req.body.password !== req.body.confirmPassword) {
        req.flash('fail', 'Mật khẩu và xác nhận mật khẩu không khớp.');
        return res.redirect("back");
    }
    if (!regex.test(req.body.password)) {
        req.flash('fail', 'Mật khẩu phải dài ít nhất 6 ký tự, bao gồm ít nhất một chữ cái in hoa, một chữ cái thường, một số và một ký tự đặc biệt (@, $, !, %, *, ?, &, #).');
        return res.redirect("back");
    }
    next();
};
exports.resetPassword = resetPassword;
const addFavoriteSong = (req, res, next) => {
    if (!req.body.songId) {
        return res.status(400).json({ "message": "Please provide songId" });
    }
    next();
};
exports.addFavoriteSong = addFavoriteSong;
const updateInfor = (req, res, next) => {
    if (!req.body.fullName) {
        req.flash('fail', 'Họ và tên không được bỏ trống.');
        return res.redirect("back");
    }
    if (!req.body.phone) {
        req.flash('fail', 'Số điện thoại không được bỏ trống.');
        return res.redirect("back");
    }
    if (!req.body.email) {
        req.flash('fail', 'Email không được bỏ trống.');
        return res.redirect("back");
    }
    next();
};
exports.updateInfor = updateInfor;
const changePassword = (req, res, next) => {
    if (!req.body.oldPassword) {
        req.flash('fail', 'Không được bỏ trống mật khẩu hiện tại.');
        return res.redirect("back");
    }
    if (!req.body.password) {
        req.flash('fail', 'Không được bỏ trống mật khẩu mới.');
        return res.redirect("back");
    }
    if (!req.body.confirmPassword) {
        req.flash('fail', 'Không được bỏ trống xác nhận mật khẩu mới.');
        return res.redirect("back");
    }
    if (req.body.password !== req.body.confirmPassword) {
        req.flash('fail', 'Mật khẩu mới và xác nhận không khớp.');
        return res.redirect("back");
    }
    if (!regex.test(req.body.password)) {
        req.flash('fail', 'Mật khẩu mới phải dài ít nhất 6 ký tự, bao gồm ít nhất một chữ cái in hoa, một chữ cái thường, một số và một ký tự đặc biệt (@, $, !, %, *, ?, &, #).');
        return res.redirect("back");
    }
    next();
};
exports.changePassword = changePassword;
