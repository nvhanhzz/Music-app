import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { cloudinary } from '../../config/cloudinary';
import streamifier from "streamifier";

// Cấu hình multer cho việc upload
const storage = multer.memoryStorage();
export const upload = multer({ storage });

const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result.secure_url);
            }
        });

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

const uploadToCloudinary = async (buffer) => {
    const result = await streamUpload(buffer);
    return result;
}

export const uploadMultipleFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req["files"]) {
            return next();
        }
        for (const key in req["files"]) {
            const file = req["files"][key][0];
            req.body[key] = await uploadToCloudinary(file.buffer);
        }
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const uploadSingleFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req["file"]) {
            return res.status(400).json({ message: "Invalid file." });
        }
        const file = req["file"];
        req.body.file = await uploadToCloudinary(file.buffer);
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
};