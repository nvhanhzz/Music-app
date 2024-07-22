"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (res, userId, exp, tokenName) => {
    const payload = { id: userId };
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SIGNATURE, { expiresIn: exp });
    res.cookie(tokenName, token, {
        httpOnly: true,
        maxAge: exp * 1000
    });
};
exports.default = generateToken;
