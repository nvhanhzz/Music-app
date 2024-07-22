"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = void 0;
const generateOTP = (length) => {
    const digits = "0123456789";
    let result = "";
    for (let i = 0; i < length; ++i) {
        result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
};
exports.generateOTP = generateOTP;
