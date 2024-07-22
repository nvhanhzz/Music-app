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
exports.patchUpdate = exports.getUpdate = exports.postCreate = exports.getCreate = exports.getEditHistory = exports.getDetail = exports.patchMultiple = exports.deleteTopic = exports.patchChangeFeatured = exports.patchChangeStatus = exports.index = void 0;
const status_enum_1 = __importDefault(require("../../enums/status.enum"));
const filterStatus_1 = __importDefault(require("../../helper/filterStatus"));
const search_1 = __importDefault(require("../../helper/search"));
const pagination_1 = __importDefault(require("../../helper/pagination"));
const sort_1 = __importDefault(require("../../helper/sort"));
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const topic_enum_1 = require("../../enums/topic.enum");
const PATH_ADMIN = process.env.PATH_ADMIN;
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('view-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
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
    const total = yield topic_model_1.default.countDocuments(find);
    const paginationObject = (0, pagination_1.default)(query, limit, total);
    const sortObject = (0, sort_1.default)(query, topic_enum_1.Sort);
    const [sortKey, sortValue] = Object.entries(sortObject)[0];
    const sortArray = [
        { name: "Vị trí giảm dần", value: "position-desc", selected: `${sortKey}-${sortValue}` === "position-desc" },
        { name: "Vị trí tăng dần", value: "position-asc", selected: `${sortKey}-${sortValue}` === "position-asc" },
        { name: "Tên Z-A", value: "title-desc", selected: `${sortKey}-${sortValue}` === "title-desc" },
        { name: "Tên A-Z", value: "title-asc", selected: `${sortKey}-${sortValue}` === "title-asc" },
    ];
    const changeMultipleOptions = [
        { value: "active", name: "Hoạt động" },
        { value: "inactive", name: "Dừng hoạt động" },
        { value: "featured", name: "Nổi bật" },
        { value: "unfeatured", name: "Không nổi bật" },
        { value: "change_position", name: "Thay đổi vị trí" },
        { value: "delete", name: "Xóa" },
    ];
    const topics = yield topic_model_1.default.find(find)
        .skip(paginationObject.skip)
        .limit(paginationObject.limit)
        .sort(sortObject)
        .populate("createdBy.adminId", "fullName")
        .select("title avatar status slug position featured");
    res.render("admin/pages/topic/index", {
        pageTitle: "Quản lý chủ đề",
        topics: topics,
        filterStatus: filter,
        keyword: searchObject.keyword,
        pagination: paginationObject,
        sortArray: sortArray,
        changeMultipleOptions: changeMultipleOptions
    });
});
exports.index = index;
const patchChangeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('update-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    const status = req.params.status;
    const itemId = req.params.id;
    if (!Object.values(status_enum_1.default).includes(status)) {
        req.flash('fail', 'Cập nhật thất bại.');
        return;
    }
    try {
        const result = yield topic_model_1.default.updateOne({
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
const patchChangeFeatured = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('update-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    const featured = req.params.featured === "true";
    const itemId = req.params.id;
    try {
        const result = yield topic_model_1.default.updateOne({
            _id: itemId,
            deleted: false
        }, {
            $set: {
                featured: featured
            },
            $push: {
                updatedBy: {
                    adminId: res.locals.currentAdmin.id,
                    action: `Thay đổi thành chủ đề ${featured ? '' : 'không '}nổi bật`,
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
exports.patchChangeFeatured = patchChangeFeatured;
const deleteTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('delete-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    const itemId = req.params.id;
    try {
        const result = yield topic_model_1.default.updateOne({
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
exports.deleteTopic = deleteTopic;
const patchMultiple = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = res.locals.currentAdmin.roleId.permission;
    const type = req.params.type;
    if ((type === "delete" && !permission.includes('delete-topic')) || (type !== "delete" && !permission.includes('update-topic'))) {
        req.flash("fail", "Bạn không đủ quyền.");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
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
        case 'featured':
            updateObject.featured = true;
            break;
        case 'unfeatured':
            updateObject.featured = false;
            break;
        case 'delete':
            updateObject.deleted = true;
            break;
        case 'change_position':
            const listPosition = req.body.inputChangePosition.split(", ");
            let check = true;
            for (let i = 0; i < listItemChange.length; ++i) {
                try {
                    const result = yield topic_model_1.default.updateOne({ _id: listItemChange[i] }, {
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
                req.flash('success', `Đã cập nhật vị trí của ${listItemChange.length} chủ đề.`);
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
                const action = `Thay đổi sang ${type}`;
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
            const update = yield topic_model_1.default.updateMany({
                _id: { $in: listItemChange },
            }, upd);
            switch (type) {
                case 'active':
                    req.flash('success', `Đã cập nhật trạng thái ${listItemChange.length} chủ đề thành hoạt động.`);
                    break;
                case 'inactive':
                    req.flash('success', `Đã cập nhật ${listItemChange.length} chủ đề thành dừng hoạt động.`);
                    break;
                case 'featured':
                    req.flash('success', `Đã cập nhật ${listItemChange.length} chủ đề thành nổi bật.`);
                    break;
                case 'unfeatured':
                    req.flash('success', `Đã cập nhật ${listItemChange.length} chủ đề thành không nổi bật.`);
                    break;
                case 'delete':
                    req.flash('success', `Đã xóa ${listItemChange.length} chủ đề.`);
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
const getDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('view-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    try {
        const id = req.params.id;
        const topic = yield topic_model_1.default.findOne({
            _id: id,
            deleted: false
        })
            .populate("createdBy.adminId", "fullName");
        if (topic) {
            res.render('admin/pages/topic/detail', {
                pageTitle: "Chi tiết chủ đề",
                topic: topic
            });
        }
        else {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }
    }
    catch (e) {
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
});
exports.getDetail = getDetail;
const getEditHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('view-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    try {
        const id = req.params.id;
        const topic = yield topic_model_1.default.findOne({
            _id: id,
            deleted: false
        }).populate("updatedBy.adminId", "fullName");
        if (!topic) {
            return res.redirect(`${PATH_ADMIN}/dashboard`);
        }
        res.render('admin/pages/editHistory/index', {
            pageTitle: "Lịch sử cập nhật",
            item: topic,
            type: "chủ đề"
        });
    }
    catch (e) {
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
});
exports.getEditHistory = getEditHistory;
const getCreate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('create-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    const positionDefault = (yield topic_model_1.default.countDocuments({
        deleted: false
    })) + 1;
    res.render("admin/pages/topic/create", {
        pageTitle: "Tạo mới chủ đề",
        positionDefault: positionDefault
    });
});
exports.getCreate = getCreate;
const postCreate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('create-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    try {
        if (req.body.file) {
            req.body.avatar = req.body.file;
        }
        req.body.position = parseInt(req.body.position);
        if (!Number.isInteger(req.body.position)) {
            const positionDefault = (yield topic_model_1.default.countDocuments({
                deleted: false
            })) + 1;
            req.body.position = positionDefault;
        }
        const newTopic = new topic_model_1.default(Object.assign(Object.assign({}, req.body), { createdBy: {
                adminId: res.locals.currentAdmin.id
            } }));
        const result = yield newTopic.save();
        if (result) {
            req.flash("success", "Tạo chủ đề thành công.");
            return res.redirect("/admin/topics");
        }
        else {
            req.flash("fail", "Tạo chủ đề thất bại.");
            return res.redirect("back");
        }
    }
    catch (e) {
        req.flash("fail", "Tạo chủ đề thất bại.");
        return res.redirect("back");
    }
});
exports.postCreate = postCreate;
const getUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('update-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    try {
        const id = req.params.id;
        const topic = yield topic_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        return res.render("admin/pages/topic/update", {
            pageTitle: "Cập nhật chủ đề",
            topic: topic
        });
    }
    catch (error) {
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
});
exports.getUpdate = getUpdate;
const patchUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permission = res.locals.currentAdmin.roleId.permission;
    if (!permission.includes('update-topic')) {
        req.flash("fail", "Bạn không đủ quyền.");
        return res.redirect(`${PATH_ADMIN}/dashboard`);
    }
    try {
        if (req.body.file) {
            req.body.avatar = req.body.file;
        }
        const id = req.params.id;
        const topic = yield topic_model_1.default.findOne({
            _id: id,
            deleted: false
        });
        let logUpdate = "";
        for (const key in req.body) {
            if (!topic[key] || (topic[key].toString() !== req.body[key].toString())) {
                logUpdate += key + " ";
            }
        }
        if (!logUpdate) {
            return res.redirect("back");
        }
        logUpdate = "Thay đổi " + logUpdate;
        const result = yield topic_model_1.default.updateOne({
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
            req.flash("success", "Cập nhật chủ đề thành công.");
            res.redirect("back");
        }
        else {
            req.flash("fail", "Cập nhật chủ đề thất bại.");
            return res.redirect("back");
        }
    }
    catch (e) {
        req.flash("fail", "Cập nhật chủ đề thất bại.");
        return res.redirect("back");
    }
});
exports.patchUpdate = patchUpdate;
