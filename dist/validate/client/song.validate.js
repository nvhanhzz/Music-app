"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePatchLike = void 0;
const validatePatchLike = (req, res, next) => {
    if (!req.body.songId) {
        return res.status(400).json({ "message": "Please provide songId" });
    }
    next();
};
exports.validatePatchLike = validatePatchLike;
