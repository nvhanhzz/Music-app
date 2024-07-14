import { Request, Response, NextFunction } from 'express';

const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&]{6,}$/;

export const validatePostRegister = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.fullName) {
        req.flash('fail', 'Vui lòng điền vào trường họ và tên.');
        return res.redirect("back");
    }
    if (!req.body.phone) {
        req.flash('fail', 'Vui lòng điền vào trường số điện thoại.');
        return res.redirect("back");
    }
    if (!req.body.email) {
        req.flash('fail', 'Vui lòng điền vào trường email.');
        return res.redirect("back");
    }
    if (!req.body.password) {
        req.flash('fail', 'Vui lòng điền vào trường mật khẩu.');
        return res.redirect("back");
    }
    if (!req.body.confirmPassword) {
        req.flash('fail', 'Vui lòng điền vào trường xác nhận mật khẩu.');
        return res.redirect("back");
    }
    if (req.body.password !== req.body.confirmPassword) {
        req.flash('fail', 'Mật khẩu và xác nhận mật khẩu không khớp.');
        return res.redirect("back");
    }
    if (!regex.test(req.body.password)) {
        req.flash('fail', 'Mật khẩu phải dài ít nhất 6 ký tự, bao gồm ít nhất một chữ cái in hoa, một chữ cái thường, một số và một ký tự đặc biệt (@, $, !, %, *, ?, &, #).');
        return res.redirect("back");
    }

    next();
}