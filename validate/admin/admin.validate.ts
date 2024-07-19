import { Request, Response, NextFunction } from 'express';

const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&]{6,}$/;

export const login = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.email) {
        req.flash('fail', 'Vui lòng điền vào trường email.');
        return res.redirect("back");
    }
    if (!req.body.password) {
        req.flash('fail', 'Vui lòng điền vào trường mật khẩu.');
        return res.redirect("back");
    }

    next();
}

export const create = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.fullName) {
        req.flash('fail', 'Họ tên không được để trống.');
        return res.redirect("back");
    }
    if (!req.body.email) {
        req.flash('fail', 'Email không được để trống.');
        return res.redirect("back");
    }
    if (!req.body.password) {
        req.flash('fail', 'Mật khẩu không được để trống.');
        return res.redirect("back");
    }

    next();
}

export const update = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.fullName) {
        req.flash('fail', 'Họ tên không được để trống.');
        return res.redirect("back");
    }
    if (!req.body.email) {
        req.flash('fail', 'Email không được để trống.');
        return res.redirect("back");
    }
    if (!req.body.password) {
        delete req.body.password;
    }

    next();
}