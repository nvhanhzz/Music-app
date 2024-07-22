"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateSong = exports.validateCreateSong = void 0;
const status_enum_1 = __importDefault(require("../../enums/status.enum"));
const validateCreateSong = (req, res, next) => {
    if (!req.body.title) {
        req.flash("fail", "Tên bài hát không được để trống.");
        return res.redirect("back");
    }
    if (!req.body.status || !Object.values(status_enum_1.default).includes(req.body.status)) {
        req.flash("fail", "Tạo mới bài hát thất bại.");
        return res.redirect("back");
    }
    if (req.body.listenCount || req.body.like) {
        req.flash("fail", "Tạo mới bài hát thất bại.");
        return res.redirect("back");
    }
    req.body.listenCount = 0;
    req.body.like = [];
    next();
};
exports.validateCreateSong = validateCreateSong;
const validateUpdateSong = (req, res, next) => {
    if (!req.body.title) {
        req.flash("fail", "Tên bài hát không được để trống.");
        return res.redirect("back");
    }
    if (req.body.status && !Object.values(status_enum_1.default).includes(req.body.status)) {
        req.flash("fail", "Cập nhật bài hát thất bại.");
        return res.redirect("back");
    }
    if (req.body.position) {
        req.body.position = parseInt(req.body.position);
        if (!Number.isInteger(req.body.position)) {
            req.flash("fail", "Cập nhật bài hát thất bại.");
            return res.redirect("back");
        }
    }
    if (req.body.like) {
        req.flash("fail", "Cập nhật bài hát thất bại.");
        return res.redirect("back");
    }
    if (req.body.listenCount) {
        req.flash("fail", "Cập nhật bài hát thất bại.");
        return res.redirect("back");
    }
    next();
};
exports.validateUpdateSong = validateUpdateSong;
