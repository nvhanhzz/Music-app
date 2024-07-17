import { Request, Response, NextFunction } from 'express';

export const validateSong = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.title) {
        req.flash("fail", "Tên bài hát không được để trống.");
        return res.redirect("back");
    }
    if (!req.body.featured) {
        req.body.featured = false;
    }
    if (!req.body.status) {
        req.body.status = "inactive";
    }
    req.body.listenCount = 0;
    req.body.like = [];

    next();
}