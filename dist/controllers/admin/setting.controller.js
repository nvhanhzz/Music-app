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
exports.update = exports.index = void 0;
const general_setting_model_1 = __importDefault(require("../../models/general-setting.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const setting = yield general_setting_model_1.default.findOne({});
    res.render("admin/pages/setting/general", {
        pageTitle: "General setting",
        setting: setting ? setting : {}
    });
});
exports.index = index;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.file) {
        req.body.logo = req.body.file;
    }
    const setting = yield general_setting_model_1.default.findOne({});
    if (!setting) {
        const newSetting = new general_setting_model_1.default(req.body);
        yield newSetting.save();
    }
    else {
        yield general_setting_model_1.default.updateOne({}, req.body);
    }
    req.flash("success", "Cập nhật thành công.");
    return res.redirect("back");
});
exports.update = update;
