"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.create = exports.login = void 0;
const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&]{6,}$/;
const login = (req, res, next) => {
    if (!req.body.email) {
        req.flash('fail', 'Vui lòng điền vào trường email.');
        return res.redirect("back");
    }
    if (!req.body.password) {
        req.flash('fail', 'Vui lòng điền vào trường mật khẩu.');
        return res.redirect("back");
    }
    next();
};
exports.login = login;
const create = (req, res, next) => {
    if (!req.body.fullName) {
        req.flash('fail', 'Họ tên không được để trống.');
        return res.redirect("back");
    }
    if (!req.body.email) {
        req.flash('fail', 'Email không được để trống.');
        return res.redirect("back");
    }
    if (!req.body.password) {
        req.flash('fail', 'Mật khẩu không được để trống.');
        return res.redirect("back");
    }
    next();
};
exports.create = create;
const update = (req, res, next) => {
    if (!req.body.fullName) {
        req.flash('fail', 'Họ tên không được để trống.');
        return res.redirect("back");
    }
    if (!req.body.email) {
        req.flash('fail', 'Email không được để trống.');
        return res.redirect("back");
    }
    if (!req.body.password) {
        delete req.body.password;
    }
    next();
};
exports.update = update;
