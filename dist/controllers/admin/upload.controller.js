"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTinyMce = void 0;
const uploadTinyMce = (req, res) => {
    res.json({
        location: req.body.file
    });
};
exports.uploadTinyMce = uploadTinyMce;
