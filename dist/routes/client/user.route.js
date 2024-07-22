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
const validate = __importStar(require("../../validate/client/user.validate"));
const controller = __importStar(require("../../controllers/client/user.controller"));
const auth_1 = require("../../middlewares/client/auth");
const upload_1 = require("../../middlewares/client/upload");
const router = express_1.default.Router();
router.get("/register", auth_1.isLoggedOut, controller.getRegister);
router.post("/register", auth_1.isLoggedOut, validate.validatePostRegister, controller.postRegister);
router.get("/login", auth_1.isLoggedOut, controller.getLogin);
router.post("/login", auth_1.isLoggedOut, controller.postLogin);
router.post("/logout", auth_1.isLoggedIn, controller.postLogout);
router.get("/password/forgot", auth_1.isLoggedOut, controller.getForgotPassword);
router.post("/password/forgot", auth_1.isLoggedOut, validate.forgotPassword, controller.postForgotPassword);
router.get("/password/verify-otp", auth_1.isLoggedOut, (0, auth_1.checkToken)({ tokenName: 'verify_otp_token', type: 'userVerifyOtp' }), controller.getVerifyOtp);
router.post("/password/verify-otp", auth_1.isLoggedOut, (0, auth_1.checkToken)({ tokenName: 'verify_otp_token', type: 'userVerifyOtp' }), validate.verifyOtp, controller.postVerifyOtp);
router.get("/password/reset", auth_1.isLoggedOut, (0, auth_1.checkToken)({ tokenName: 'reset-password-token', type: 'userResetPassword' }), controller.getResetPassword);
router.patch("/password/reset", auth_1.isLoggedOut, (0, auth_1.checkToken)({ tokenName: 'reset-password-token', type: 'userResetPassword' }), validate.resetPassword, controller.patchResetPassword);
router.get("/information", auth_1.isLoggedIn, controller.getInformation);
router.get("/update-infor", auth_1.isLoggedIn, controller.getUpdateInfor);
router.patch('/update-infor', auth_1.isLoggedIn, upload_1.upload.single('avatar'), upload_1.uploadSingleFile, validate.updateInfor, controller.patchUpdateInfor);
router.get("/password/change", auth_1.isLoggedIn, controller.getChangePassword);
router.patch("/password/change", auth_1.isLoggedIn, validate.changePassword, controller.patchChangePassword);
router.patch("/addFavoriteSong", auth_1.isLoggedIn, validate.addFavoriteSong, controller.addFavoriteSong);
exports.default = router;
