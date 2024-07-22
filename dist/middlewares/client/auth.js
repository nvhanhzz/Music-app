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
exports.isLoggedOut = exports.isLoggedIn = exports.checkToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const status_enum_1 = __importDefault(require("../../enums/status.enum"));
const verifyToken = (token, key) => {
    try {
        return jsonwebtoken_1.default.verify(token, key);
    }
    catch (err) {
        console.error('Error verifying token:', err);
        return null;
    }
};
const checkToken = (options = { tokenName: '' }) => {
    const { tokenName, type } = options;
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.cookies || !req.cookies[tokenName]) {
            return next();
        }
        const token = req.cookies[tokenName];
        const key = process.env.JWT_SIGNATURE;
        const decoded = verifyToken(token, key);
        if (!decoded) {
            res.clearCookie(tokenName);
            return next();
        }
        try {
            const user = yield user_model_1.default.findOne({
                _id: decoded.id,
                deleted: false,
                status: status_enum_1.default.ACTIVE
            }).select("-password");
            if (!user) {
                res.clearCookie(tokenName);
                return next();
            }
            if (type) {
                res.locals[type] = user;
            }
            return next();
        }
        catch (error) {
            console.error('Error finding user:', error);
            return;
        }
    });
};
exports.checkToken = checkToken;
const isLoggedIn = (req, res, next) => {
    if (!res.locals.currentUser) {
        req.flash('fail', 'Bạn cần đăng nhập trước.');
        return res.redirect("back");
    }
    return next();
};
exports.isLoggedIn = isLoggedIn;
const isLoggedOut = (req, res, next) => {
    if (res.locals.currentUser) {
        req.flash('fail', 'Bạn đã đăng nhập rồi.');
        return res.redirect("back");
    }
    return next();
};
exports.isLoggedOut = isLoggedOut;
