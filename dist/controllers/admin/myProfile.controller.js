"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const PATH_ADMIN = process.env.PATH_ADMIN;
const index = (req, res) => {
    const admin = res.locals.currentAdmin;
    res.render("admin/pages/myProfile/index", {
        pageTitle: "Thông tin cá nhân",
        admin: admin
    });
};
exports.index = index;
