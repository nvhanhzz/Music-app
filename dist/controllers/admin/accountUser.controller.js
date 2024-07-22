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
exports.getEditHistory = exports.patchMultiple = exports.deleteUser = exports.patchChangeStatus = exports.getUserDetail = exports.index = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const status_enum_1 = __importDefault(require("../../enums/status.enum"));
const filterStatus_1 = __importDefault(require("../../helper/filterStatus"));
const search_1 = __importDefault(require("../../helper/search"));
const pagination_1 = __importDefault(require("../../helper/pagination"));
const sort_1 = __importDefault(require("../../helper/sort"));
const accountUser_enum_1 = require("../../enums/accountUser.enum");
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
    const status = query.status;
    if (Object.values(status_enum_1.default).includes(status)) {
        find["status"] = status;
    }
    if (searchObject && searchObject["regex"]) {
        find["slug"] = searchObject["regex"];
    }
    const limit = 5;
    const total = yield user_model_1.default.countDocuments(find);
    const paginationObject = (0, pagination_1.default)(query, limit, total);
    const sortObject = (0, sort_1.default)(query, accountUser_enum_1.Sort);
    const [sortKey, sortValue] = Object.entries(sortObject)[0];
    const sortArray = [
        { name: "Tên Z-A", value: "fullName-desc", selected: `${sortKey}-${sortValue}` === "fullName-desc" },
        { name: "Tên A-Z", value: "fullName-asc", selected: `${sortKey}-${sortValue}` === "fullName-asc" },
    ];
    const changeMultipleOptions = [
        { value: "active", name: "Hoạt động" },
        { value: "inactive", name: "Dừng hoạt động" },
        { value: "delete", name: "Xóa" },
    ];
    const users = yield user_model_1.default.find(find)
        .skip(paginationObject.skip)
        .limit(paginationObject.limit)
        .sort(sortObject)
        .select("-password");
    res.render("admin/pages/accountUser/index", {
        pageTitle: "Quản lý tài khoản user",
        users: users,
        filterStatus: filter,
        keyword: searchObject.keyword,
        pagination: paginationObject,
        sortArray: sortArray,
        changeMultipleOptions: changeMultipleOptions
    });
});
exports.index = index;
const getUserDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield user_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        if (!user) {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }
        return res.render("admin/pages/accountUser/detail", {
            pageTitle: "Chi tiết người dùng",
            user: user
        });
    }
    catch (error) {
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
});
exports.getUserDetail = getUserDetail;
const patchChangeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const status = req.params.status;
    const itemId = req.params.id;
    if (!Object.values(status_enum_1.default).includes(status)) {
        req.flash('fail', 'Cập nhật thất bại.');
        return;
    }
    try {
        const result = yield user_model_1.default.updateOne({
            _id: itemId,
            deleted: false
        }, {
            $set: {
                status: status
            },
            $push: {
                updatedBy: {
                    adminId: res.locals.currentAdmin.id,
                    action: `Thay đổi trạng thái sang ${status}`,
                    updatedAt: new Date()
                }
            }
        });
        if (result.modifiedCount === 1) {
            req.flash('success', 'Cập nhật thành công.');
        }
        else {
            req.flash('fail', 'Cập nhật thất bại.');
        }
    }
    catch (error) {
        req.flash('fail', 'Cập nhật thất bại.');
    }
    res.redirect("back");
});
exports.patchChangeStatus = patchChangeStatus;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const itemId = req.params.id;
    try {
        const result = yield user_model_1.default.updateOne({
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
exports.deleteUser = deleteUser;
const patchMultiple = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.params.type;
    const ListItemChange = req.body.inputChangeMultiple.split(", ");
    const adminId = res.locals.currentAdmin._id;
    const updateObject = {};
    switch (type) {
        case 'active':
            updateObject.status = 'active';
            break;
        case 'inactive':
            updateObject.status = 'inactive';
            break;
        case 'delete':
            updateObject.deleted = true;
            break;
        default:
            break;
    }
    try {
        let upd = {};
        if (type !== "delete") {
            const action = `Thay đổi trạng thái sang ${type}`;
            upd = {
                $set: updateObject,
                $push: {
                    updatedBy: {
                        adminId: adminId,
                        action: action,
                        updatedAt: new Date()
                    }
                }
            };
        }
        else {
            upd = {
                $set: {
                    deleted: true,
                    deletedBy: {
                        adminId: res.locals.currentAdmin.id,
                        deletedAt: new Date()
                    }
                }
            };
        }
        const update = yield user_model_1.default.updateMany({
            _id: { $in: ListItemChange },
        }, upd);
        switch (type) {
            case 'active':
                req.flash('success', `Đã cập nhật trạng thái ${ListItemChange.length} tài khoản thành hoạt động.`);
                break;
            case 'inactive':
                req.flash('success', `Đã cập nhật trạng thái ${ListItemChange.length} tài khoản thành dừng hoạt động.`);
                break;
            case 'delete':
                req.flash('success', `Đã xóa ${ListItemChange.length} tài khoản.`);
                break;
        }
    }
    catch (error) {
        console.error(error);
        req.flash('fail', 'Lỗi!!!');
    }
    return res.redirect("back");
});
exports.patchMultiple = patchMultiple;
const getEditHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield user_model_1.default.findOne({
            _id: id,
            deleted: false
        }).populate("updatedBy.adminId", "fullName");
        if (!user) {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }
        res.render('admin/pages/editHistory/index', {
            pageTitle: "Lịch sử cập nhật",
            item: user,
            type: "tài khoản"
        });
    }
    catch (e) {
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
});
exports.getEditHistory = getEditHistory;
