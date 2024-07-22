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
exports.uploadSingleFile = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("../../config/cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage });
const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result.secure_url);
            }
        });
        streamifier_1.default.createReadStream(buffer).pipe(stream);
    });
};
const uploadToCloudinary = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield streamUpload(buffer);
    return result;
});
const uploadSingleFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req["file"]) {
            return next();
        }
        const file = req["file"];
        req.body.file = yield uploadToCloudinary(file.buffer);
        return next();
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
exports.uploadSingleFile = uploadSingleFile;
