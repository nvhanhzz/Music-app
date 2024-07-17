import { Request, Response, NextFunction } from 'express';
import ListStatus from '../../enums/status.enum';

export const validateCreateSong = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.title) {
        req.flash("fail", "Tên bài hát không được để trống.");
        return res.redirect("back");
    }
    if (!req.body.status || !Object.values(ListStatus).includes(req.body.status)) {
        req.body.status = "inactive";
    }
    req.body.listenCount = 0;
    req.body.like = [];

    next();
}

export const validateUpdateSong = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.title) {
        req.flash("fail", "Tên bài hát không được để trống.");
        return res.redirect("back");
    }
    if (req.body.status && !Object.values(ListStatus).includes(req.body.status)) {
        req.body.status = "inactive";
    }
    if (req.body.position) {
        req.body.position = parseInt(req.body.position);
        if (!Number.isInteger(req.body.position)) {
            req.flash("fail", "Cập nhật bài hát thất bại.");
            return res.redirect("back");
        }
    }
    if (req.body.like) {
        delete req.body.like;
    }
    if (req.body.listenCount) {
        delete req.body.listenCount;
    }

    next();
}