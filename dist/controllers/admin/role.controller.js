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
exports.getEditHistory = exports.patchUpdate = exports.getUpdate = exports.postCreate = exports.getCreate = exports.getRoleDetail = exports.patchMultiple = exports.deleteRole = exports.index = void 0;
const role_model_1 = __importDefault(require("../../models/role.model"));
const filterStatus_1 = __importDefault(require("../../helper/filterStatus"));
const search_1 = __importDefault(require("../../helper/search"));
const pagination_1 = __importDefault(require("../../helper/pagination"));
const sort_1 = __importDefault(require("../../helper/sort"));
const role_enum_1 = require("../../enums/role.enum");
const PATH_ADMIN = process.env.PATH_ADMIN;
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const filter = (0, filterStatus_1.default)(query);
    let searchObject = {
        keyword: ""
    };
    if (query.keyword) {
        searchObject = (0, search_1.default)(query);
    }
    const find = {
        deleted: false
    };
    if (searchObject && searchObject["regex"]) {
        find["slug"] = searchObject["regex"];
    }
    const limit = 5;
    const total = yield role_model_1.default.countDocuments(find);
    const paginationObject = (0, pagination_1.default)(query, limit, total);
    const sortObject = (0, sort_1.default)(query, role_enum_1.Sort);
    const [sortKey, sortValue] = Object.entries(sortObject)[0];
    const sortArray = [
        { name: "Tên Z-A", value: "title-desc", selected: `${sortKey}-${sortValue}` === "title-desc" },
        { name: "Tên A-Z", value: "title-asc", selected: `${sortKey}-${sortValue}` === "title-asc" },
    ];
    const changeMultipleOptions = [
        { value: "delete", name: "Xóa" },
    ];
    const roles = yield role_model_1.default.find(find)
        .skip(paginationObject.skip)
        .limit(paginationObject.limit)
        .sort(sortObject)
        .populate("createdBy.adminId", "fullName")
        .populate("updatedBy.adminId", "fullName");
    res.render("admin/pages/role/index", {
        pageTitle: "Quản lý nhóm quyền",
        roles: roles,
        filterStatus: filter,
        keyword: searchObject.keyword,
        pagination: paginationObject,
        sortArray: sortArray,
        changeMultipleOptions: changeMultipleOptions
    });
});
exports.index = index;
const deleteRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const itemId = req.params.id;
    try {
        const result = yield role_model_1.default.updateOne({
            _id: itemId,
            deleted: false
        }, {
            $set: {
                deleted: true,
                deletedBy: {
                    adminId: res.locals.currentAdmin.id,
                    deletedAt: new Date()
                }
            }
        });
        if (result.modifiedCount === 1) {
            req.flash('success', 'Xóa thành công.');
        }
        else {
            req.flash('fail', 'Xóa thất bại.');
        }
    }
    catch (error) {
        req.flash('fail', 'Xóa thất bại.');
    }
    res.redirect("back");
});
exports.deleteRole = deleteRole;
const patchMultiple = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listItemChange = req.body.inputChangeMultiple.split(", ");
    const adminId = res.locals.currentAdmin._id;
    const upd = {
        $set: {
            deleted: true,
            deletedBy: {
                adminId: res.locals.currentAdmin.id,
                deletedAt: new Date()
            }
        }
    };
    try {
        const update = yield role_model_1.default.updateMany({
            _id: { $in: listItemChange },
        }, upd);
        req.flash('success', `Đã xóa ${listItemChange.length} nhóm quyền.`);
    }
    catch (error) {
        console.error(error);
        req.flash('fail', 'Lỗi!!!');
    }
    res.redirect("back");
});
exports.patchMultiple = patchMultiple;
const getRoleDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const role = yield role_model_1.default.findOne({
            _id: id,
            deleted: false
        }).populate("createdBy.adminId", "fullName");
        if (role) {
            res.render('admin/pages/role/detail', {
                pageTitle: "Chi tiết nhóm quyền",
                role: role
            });
        }
        else {
            res.redirect(`${PATH_ADMIN}/dashboard`);
        }
    }
    catch (e) {
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
});
exports.getRoleDetail = getRoleDetail;
const getCreate = (req, res) => {
    res.render("admin/pages/role/create", {
        pageTitle: "Tạo mới nhóm quyền"
    });
};
exports.getCreate = getCreate;
const postCreate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newRole = new role_model_1.default(Object.assign(Object.assign({}, req.body), { createdBy: {
                adminId: res.locals.currentAdmin.id
            } }));
        const result = yield newRole.save();
        if (result) {
            req.flash("success", "Tạo nhóm quyền thành công.");
            res.redirect("/admin/roles");
        }
        else {
            req.flash("fail", "Tạo nhóm quyền thất bại.");
            return res.redirect("back");
        }
    }
    catch (e) {
        req.flash("fail", "Tạo nhóm quyền thất bại.");
        return res.redirect("back");
    }
});
exports.postCreate = postCreate;
const getUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const role = yield role_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!role) {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }
        res.render("admin/pages/role/update", {
            pageTitle: "Cập nhật nhóm quyền",
            role: role
        });
    }
    catch (error) {
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
});
exports.getUpdate = getUpdate;
const patchUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const role = yield role_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        let logUpdate = "";
        for (const key in req.body) {
            if (!role[key] || (role[key].toString() !== req.body[key].toString())) {
                logUpdate += key + " ";
            }
        }
        if (!logUpdate) {
            return res.redirect("back");
        }
        logUpdate = "Thay đổi " + logUpdate;
        const result = yield role_model_1.default.updateOne({
            _id: id,
            deleted: false
        }, {
            $set: req.body,
            $push: {
                updatedBy: {
                    adminId: res.locals.currentAdmin.id,
                    action: logUpdate,
                    updatedAt: new Date()
                }
            }
        });
        if (result) {
            req.flash("success", "Cập nhật nhóm quyền thành công.");
            res.redirect("back");
        }
        else {
            req.flash("fail", "Cập nhật nhóm quyền thất bại.");
            return res.redirect("back");
        }
    }
    catch (e) {
        req.flash("fail", "Cập nhật nhóm quyền thất bại.");
        return res.redirect("back");
    }
});
exports.patchUpdate = patchUpdate;
const getEditHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const role = yield role_model_1.default.findOne({
            _id: id,
            deleted: false
        }).populate("updatedBy.adminId", "fullName");
        if (!role) {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }
        res.render('admin/pages/editHistory/index', {
            pageTitle: "Lịch sử cập nhật",
            item: role,
            type: "nhóm quyền"
        });
    }
    catch (e) {
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
});
exports.getEditHistory = getEditHistory;
