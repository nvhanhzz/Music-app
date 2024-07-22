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
exports.getEditHistory = exports.patchUpdate = exports.getUpdate = exports.postCreate = exports.getCreate = exports.getAdminDetail = exports.patchMultiple = exports.deleteAdmin = exports.patchChangeStatus = exports.index = void 0;
const admin_model_1 = __importDefault(require("../../models/admin.model"));
const status_enum_1 = __importDefault(require("../../enums/status.enum"));
const filterStatus_1 = __importDefault(require("../../helper/filterStatus"));
const search_1 = __importDefault(require("../../helper/search"));
const pagination_1 = __importDefault(require("../../helper/pagination"));
const sort_1 = __importDefault(require("../../helper/sort"));
const accountAdmin_enum_1 = require("../../enums/accountAdmin.enum");
const role_model_1 = __importDefault(require("../../models/role.model"));
const hashPassword_1 = require("../../helper/hashPassword");
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
    const total = yield admin_model_1.default.countDocuments(find);
    const paginationObject = (0, pagination_1.default)(query, limit, total);
    const sortObject = (0, sort_1.default)(query, accountAdmin_enum_1.Sort);
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
    const admins = yield admin_model_1.default.find(find)
        .skip(paginationObject.skip)
        .limit(paginationObject.limit)
        .sort(sortObject)
        .populate("roleId", "title")
        .populate("createdBy.adminId", "fullName")
        .select("-password");
    res.render("admin/pages/accountAdmin/index", {
        pageTitle: "Quản lý tài khoản admin",
        admins: admins,
        filterStatus: filter,
        keyword: searchObject.keyword,
        pagination: paginationObject,
        sortArray: sortArray,
        changeMultipleOptions: changeMultipleOptions
    });
});
exports.index = index;
const patchChangeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const status = req.params.status;
    const itemId = req.params.id;
    if (!Object.values(status_enum_1.default).includes(status)) {
        req.flash('fail', 'Cập nhật thất bại.');
        return;
    }
    try {
        const result = yield admin_model_1.default.updateOne({
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
const deleteAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const itemId = req.params.id;
    try {
        const result = yield admin_model_1.default.updateOne({
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
exports.deleteAdmin = deleteAdmin;
const patchMultiple = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.params.type;
    const listItemChange = req.body.inputChangeMultiple.split(", ");
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
        case 'change_position':
            const listPosition = req.body.inputChangePosition.split(", ");
            let check = true;
            for (let i = 0; i < listItemChange.length; ++i) {
                try {
                    const result = yield admin_model_1.default.updateOne({ _id: listItemChange[i] }, {
                        $set: { position: parseInt(listPosition[i]) },
                        $push: {
                            updatedBy: {
                                adminId: adminId,
                                action: "Thay đổi vị trí",
                                updatedAt: new Date()
                            }
                        }
                    });
                }
                catch (error) {
                    check = false;
                    console.error(`Error updating product ${listItemChange[i]}:`, error);
                }
            }
            if (check) {
                req.flash('success', `Đã cập nhật vị trí của ${listItemChange.length} tài khoản admin.`);
            }
            res.redirect("back");
            return;
        default:
            break;
    }
    if (type !== "change_position") {
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
            const update = yield admin_model_1.default.updateMany({
                _id: { $in: listItemChange },
            }, upd);
            switch (type) {
                case 'active':
                    req.flash('success', `Đã cập nhật trạng thái ${listItemChange.length} tài khoản admin thành hoạt động.`);
                    break;
                case 'inactive':
                    req.flash('success', `Đã cập nhật trạng thái ${listItemChange.length} tài khoản admin thành dừng hoạt động.`);
                    break;
                case 'delete':
                    req.flash('success', `Đã xóa ${listItemChange.length} tài khoản admin.`);
                    break;
            }
        }
        catch (error) {
            console.error(error);
            req.flash('fail', 'Lỗi!!!');
        }
    }
    res.redirect("back");
});
exports.patchMultiple = patchMultiple;
const getAdminDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const admin = yield admin_model_1.default.findOne({
            _id: id,
            deleted: false
        })
            .populate("roleId", "title")
            .populate("createdBy.adminId", "fullName");
        if (admin) {
            res.render('admin/pages/accountAdmin/detail', {
                pageTitle: "Chi tiết tài khoản admin",
                admin: admin
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
exports.getAdminDetail = getAdminDetail;
const getCreate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield role_model_1.default.find({
        deleted: false,
    }).populate("title");
    res.render("admin/pages/accountAdmin/create", {
        pageTitle: "Tạo mới tài khoản admin",
        roles: roles,
    });
});
exports.getCreate = getCreate;
const postCreate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accountExist = yield admin_model_1.default.findOne({
        email: req.body.email
    });
    if (accountExist) {
        req.flash('fail', 'Email đã tồn tại trong hệ thống.');
        return res.redirect("back");
    }
    if (req.body.file) {
        req.body.avatar = req.body.file;
    }
    req.body.createdBy = {
        adminId: res.locals.currentAdmin.id
    };
    req.body.password = yield (0, hashPassword_1.hashPassword)(req.body.password);
    const admin = new admin_model_1.default(req.body);
    try {
        yield admin.save();
        req.flash('success', 'Tạo tài khoản admin thành công');
    }
    catch (error) {
        console.error(error);
    }
    return res.redirect(`${PATH_ADMIN}/account-admin`);
});
exports.postCreate = postCreate;
const getUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const admin = yield admin_model_1.default.findOne({
        _id: id,
        deleted: false
    });
    const roles = yield role_model_1.default.find({
        deleted: false,
    }).populate("title");
    res.render("admin/pages/accountAdmin/update", {
        pageTitle: "Cập nhật tài khoản admin",
        admin: admin,
        roles: roles
    });
});
exports.getUpdate = getUpdate;
const patchUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const admin = yield admin_model_1.default.findOne({
        _id: id,
        deleted: false
    });
    if (!admin) {
        return res.redirect("back");
    }
    const accountExist = yield admin_model_1.default.findOne({
        email: req.body.email
    });
    if (accountExist && accountExist.id !== id) {
        req.flash('fail', 'Email đã tồn tại trong hệ thống.');
        return res.redirect("back");
    }
    if (req.body.file) {
        req.body.avatar = req.body.file;
    }
    if (req.body.password) {
        req.body.password = yield (0, hashPassword_1.hashPassword)(req.body.password);
    }
    let logUpdate = "";
    for (const key in req.body) {
        if (!admin[key] || (admin[key].toString() !== req.body[key].toString())) {
            logUpdate += key + " ";
        }
    }
    if (!logUpdate) {
        return res.redirect("back");
    }
    logUpdate = "Thay đổi " + logUpdate;
    try {
        yield admin_model_1.default.updateOne({
            _id: id
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
        req.flash('success', 'Cập nhật thành công');
    }
    catch (error) {
        req.flash("fail", "Cập nhật thất bại.");
    }
    return res.redirect("back");
});
exports.patchUpdate = patchUpdate;
const getEditHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const admin = yield admin_model_1.default.findOne({
            _id: id,
            deleted: false
        }).populate("updatedBy.adminId", "fullName");
        if (!admin) {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }
        res.render('admin/pages/editHistory/index', {
            pageTitle: "Lịch sử cập nhật",
            item: admin,
            type: "tài khoản admin"
        });
    }
    catch (e) {
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
});
exports.getEditHistory = getEditHistory;
