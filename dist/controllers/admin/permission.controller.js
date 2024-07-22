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
exports.updatePermission = exports.index = void 0;
const role_model_1 = __importDefault(require("../../models/role.model"));
const PATH_ADMIN = process.env.PATH_ADMIN;
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield role_model_1.default.find({ deleted: false });
    res.render("admin/pages/permission/index", {
        roles: roles,
        pageTitle: "Permission"
    });
});
exports.index = index;
const updatePermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = res.locals.currentAdmin._id;
        const permissions = JSON.parse(req.body.permissions);
        for (const item of permissions) {
            yield role_model_1.default.updateOne({
                _id: item.id,
                deleted: false
            }, {
                $set: {
                    permission: item.listPermission
                },
                $push: {
                    updatedBy: {
                        adminId: adminId,
                        action: "Phân quyền",
                        updatedAt: new Date()
                    }
                }
            });
        }
        req.flash("success", "Cập nhật phân quyền thành công");
        res.redirect("back");
    }
    catch (error) {
        req.flash("fail", "Lỗi, hãy thử lại");
        res.redirect(`${PATH_ADMIN}/dashboard`);
    }
});
exports.updatePermission = updatePermission;
