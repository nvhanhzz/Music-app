import { Request, Response } from "express";

export const uploadTinyMce = (req: Request, res: Response): void => {
    res.json({
        location: req.body.file
    });
}