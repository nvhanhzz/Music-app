import { Request, Response, NextFunction } from 'express';

export const create = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.title) {
        req.flash("fail", "Tên nhóm quyền không được để trống.");
        return res.redirect("back");
    }

    next();
}