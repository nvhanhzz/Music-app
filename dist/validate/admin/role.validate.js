"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const create = (req, res, next) => {
    if (!req.body.title) {
        req.flash("fail", "Tên nhóm quyền không được để trống.");
        return res.redirect("back");
    }
    next();
};
exports.create = create;
