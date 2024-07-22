"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller = __importStar(require("../../controllers/admin/accountAdmin.controller"));
const upload_1 = require("../../middlewares/admin/upload");
const validate = __importStar(require("../../validate/admin/admin.validate"));
const checkRolePermission_1 = require("../../middlewares/admin/checkRolePermission");
const router = express_1.default.Router();
router.patch("/change-status/:status/:id", (0, checkRolePermission_1.checkRolePermission)({ permission: "update-admin" }), controller.patchChangeStatus);
router.delete("/delete/:id", (0, checkRolePermission_1.checkRolePermission)({ permission: "delete-admin" }), controller.deleteAdmin);
router.patch("/change-multiple/:type", (0, checkRolePermission_1.checkPermissionForPatchMultiple)({ deletePermission: "delete-admin", updatePermission: "update-admin" }), controller.patchMultiple);
router.get("/detail/:id", (0, checkRolePermission_1.checkRolePermission)({ permission: "view-admin" }), controller.getAdminDetail);
router.get("/create", (0, checkRolePermission_1.checkRolePermission)({ permission: "create-admin" }), controller.getCreate);
router.post("/create", (0, checkRolePermission_1.checkRolePermission)({ permission: "create-admin" }), upload_1.upload.single("avatar"), validate.create, upload_1.uploadSingleFile, controller.postCreate);
router.get("/update/:id", (0, checkRolePermission_1.checkRolePermission)({ permission: "update-admin" }), controller.getUpdate);
router.patch("/update/:id", (0, checkRolePermission_1.checkRolePermission)({ permission: "update-admin" }), upload_1.upload.single("avatar"), validate.update, upload_1.uploadSingleFile, controller.patchUpdate);
router.get("/update-history/:id", (0, checkRolePermission_1.checkRolePermission)({ permission: "view-admin" }), controller.getEditHistory);
router.get("/", (0, checkRolePermission_1.checkRolePermission)({ permission: "view-admin" }), controller.index);
exports.default = router;
