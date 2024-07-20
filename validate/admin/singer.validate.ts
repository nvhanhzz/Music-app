import { Request, Response, NextFunction } from 'express';
import ListStatus from '../../enums/status.enum';

export const create = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.fullName) {
        req.flash("fail", "Tên ca sĩ không được để trống.");
        return res.redirect("back");
    }
    if (!req.body.status || !Object.values(ListStatus).includes(req.body.status)) {
        req.flash("fail", "Tạo mới ca sĩ thất bại.");
        return res.redirect("back");
    }

    next();
}

export const update = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.fullName) {
        req.flash("fail", "Tên ca sĩ không được để trống.");
        return res.redirect("back");
    }
    if (req.body.status && !Object.values(ListStatus).includes(req.body.status)) {
        req.flash("fail", "Cập nhật ca sĩ thất bại.");
        return res.redirect("back");
    }
    if (req.body.position) {
        req.body.position = parseInt(req.body.position);
        if (!Number.isInteger(req.body.position)) {
            req.flash("fail", "Cập nhật ca sĩ thất bại.");
            return res.redirect("back");
        }
    }

    next();
}