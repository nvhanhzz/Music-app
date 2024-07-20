import { Request, Response, NextFunction } from 'express';
import ListStatus from '../../enums/status.enum';

export const validateCreateSong = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.title) {
        req.flash("fail", "Tên bài hát không được để trống.");
        return res.redirect("back");
    }
    if (!req.body.status || !Object.values(ListStatus).includes(req.body.status)) {
        req.flash("fail", "Tạo mới bài hát thất bại.");
        return res.redirect("back");
    }
    if (req.body.listenCount || req.body.like) {
        req.flash("fail", "Tạo mới bài hát thất bại.");
        return res.redirect("back");
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
        req.flash("fail", "Cập nhật bài hát thất bại.");
        return res.redirect("back");
    }
    if (req.body.position) {
        req.body.position = parseInt(req.body.position);
        if (!Number.isInteger(req.body.position)) {
            req.flash("fail", "Cập nhật bài hát thất bại.");
            return res.redirect("back");
        }
    }
    if (req.body.like) {
        req.flash("fail", "Cập nhật bài hát thất bại.");
        return res.redirect("back");
    }
    if (req.body.listenCount) {
        req.flash("fail", "Cập nhật bài hát thất bại.");
        return res.redirect("back");
    }

    next();
}