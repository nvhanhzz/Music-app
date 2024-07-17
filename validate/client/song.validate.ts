import { Request, Response, NextFunction } from 'express';

export const validatePatchLike = (req: Request, res: Response, next: NextFunction): Response => {
    if (!req.body.songId) {
        return res.status(400).json({ "message": "Please provide songId" });
    }

    next();
}