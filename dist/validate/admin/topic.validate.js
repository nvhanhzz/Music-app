"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.create = void 0;
const status_enum_1 = __importDefault(require("../../enums/status.enum"));
const create = (req, res, next) => {
    if (!req.body.title) {
        req.flash("fail", "Tên chủ đề không được để trống.");
        return res.redirect("back");
    }
    if (!req.body.status || !Object.values(status_enum_1.default).includes(req.body.status)) {
        req.body.status = "inactive";
    }
    next();
};
exports.create = create;
const update = (req, res, next) => {
    if (!req.body.title) {
        req.flash("fail", "Tên chủ đề không được để trống.");
        return res.redirect("back");
    }
    if (req.body.status && !Object.values(status_enum_1.default).includes(req.body.status)) {
        req.flash("fail", "Cập nhật chủ đề thất bại.");
        return res.redirect("back");
    }
    if (req.body.position) {
        req.body.position = parseInt(req.body.position);
        if (!Number.isInteger(req.body.position)) {
            req.flash("fail", "Cập nhật chủ đề thất bại.");
            return res.redirect("back");
        }
    }
    next();
};
exports.update = update;
