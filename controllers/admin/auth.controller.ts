import { Request, Response } from "express";
import Admin from "../../models/admin.model";
import { comparePassword } from "../../helper/hashPassword";
import ListStatus from "../../enums/status.enum";
import generateToken from "../../helper/generateToken";

// [GET] /admin/admin/login
export const getLogin = (req: Request, res: Response): void => {
    res.render('admin/pages/auth/login', {
        pageTitle: "Đăng nhập"
    });
}

// [POST] /admin/admin/login
export const postLogin = async (req: Request, res: Response): Promise<void> => {
    const admin = await Admin.findOne({
        email: req.body.email,
        deleted: false,
        status: ListStatus.ACTIVE
    });
    if (!admin) {
        req.flash("fail", "Email hoặc mật khẩu không chính xác.");
        return res.redirect("back");
    }

    const confirm = await comparePassword(req.body.password, admin.password.toString());
    if (!confirm) {
        req.flash("fail", "Email hoặc mật khẩu không chính xác.");
        return res.redirect("back");
    }

    const TOKEN_EXP: number = parseInt(process.env.TOKEN_EXP, 10);
    generateToken(res, admin.id, TOKEN_EXP, "tokenAdmin");

    const prefixAdmin = process.env.PATH_ADMIN;
    req.flash("fail", `Đăng nhập thành công, xin chào ${admin.fullName}.`);
    return res.redirect(`${prefixAdmin}/dashboard`);
}

// [POST] /admin/admin/logout
export const postLogout = (req: Request, res: Response): void => {
    res.clearCookie("tokenAdmin");
    req.flash("success", "Đăng xuất thành công.");
    const prefixAdmin = process.env.PATH_ADMIN;
    return res.redirect(`${prefixAdmin}/auth/login`);
}