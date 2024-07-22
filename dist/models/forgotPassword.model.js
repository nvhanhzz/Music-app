"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const forgotPasswordSchema = new mongoose_1.default.Schema({
    email: String,
    otp: String,
    attemptsLeft: Number,
    createdAt: { type: Date, default: Date.now, expires: '3m' }
});
const ForgotPassword = mongoose_1.default.model("ForgotPassword", forgotPasswordSchema, "forgot-password");
exports.default = ForgotPassword;
