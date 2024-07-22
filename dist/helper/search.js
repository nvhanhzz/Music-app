"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const unidecode_1 = __importDefault(require("unidecode"));
const search = (query) => {
    const { keyword } = query;
    let normalizedKeyword = keyword ? (0, unidecode_1.default)(keyword).toLowerCase() : '';
    normalizedKeyword = normalizedKeyword.replace(/\s+/g, "-").trim();
    const res = {
        regex: new RegExp(normalizedKeyword, "i"),
        keyword: keyword
    };
    return res;
};
exports.default = search;
