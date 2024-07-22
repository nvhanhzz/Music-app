"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const generalSettingSchema = new mongoose_1.default.Schema({
    websiteName: String,
    logo: String,
    phone: String,
    email: String,
    address: String,
    copyright: String
}, { timestamps: true });
const GeneralSetting = mongoose_1.default.model("GeneralSetting", generalSettingSchema, "general-setting");
exports.default = GeneralSetting;
