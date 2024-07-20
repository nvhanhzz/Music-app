import { Request, Response, NextFunction } from 'express';
import ListStatus from '../../enums/status.enum';

export const create = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.title) {
        req.flash("fail", "Tên chủ đề không được để trống.");
        return res.redirect("back");
    }
    if (!req.body.status || !Object.values(ListStatus).includes(req.body.status)) {
        req.body.status = "inactive";
    }

    next();
}

export const update = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.title) {
        req.flash("fail", "Tên chủ đề không được để trống.");
        return res.redirect("back");
    }
    if (req.body.status && !Object.values(ListStatus).includes(req.body.status)) {
        req.body.status = "inactive";
    }
    if (req.body.position) {
        req.body.position = parseInt(req.body.position);
        if (!Number.isInteger(req.body.position)) {
            req.flash("fail", "Cập nhật chủ đề thất bại.");
            return res.redirect("back");
        }
    }

    next();
}