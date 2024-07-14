import { jwt } from 'jsonwebtoken';
import { Request, Response } from "express";
import User from "../../models/user.model";
import { hashPassword, comparePassword } from "../../helper/hashPassword";
import generateToken from '../../helper/generateToken';

enum ListStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}

// [GET] /user/register
export const getRegister = async (req: Request, res: Response): Promise<void> => {
    res.render('client/pages/user/register', {
        pageTitle: "Đăng ký"
    });
}

// [POST] /user/register
export const postRegister = async (req: Request, res: Response): Promise<void> => {
    const TOKEN_EXP: number = parseInt(process.env.TOKEN_EXP, 10);
    const existUser = await User.findOne({
        email: req.body.email
    });
    if (existUser) {
        req.flash('fail', 'Email đã tồn tại.');
        return res.redirect("back");
    }

    req.body.password = await hashPassword(req.body.password);
    req.body.status = ListStatus.ACTIVE;
    req.body.avatar = "https://th.bing.com/th/id/OIP.VImWjbk4meO4actlY89hAAHaGj?w=1099&h=973&rs=1&pid=ImgDetMain";
    const newUser = new User(req.body);
    await newUser.save();

    generateToken(res, newUser.id, TOKEN_EXP, "token");

    req.flash("success", `Register success, hello ${newUser.fullName}.`);
    res.redirect(`/`);
}

// [GET] /user/login
export const getLogin = async (req: Request, res: Response): Promise<void> => {
    res.render('client/pages/user/login', {
        pageTitle: "Đăng nhập"
    });
}

// [POST] /user/login
export const postLogin = async (req: Request, res: Response): Promise<void> => {
    const TOKEN_EXP: number = parseInt(process.env.TOKEN_EXP, 10);
    const user = await User.findOne({
        email: req.body.email,
        deleted: false
    });
    if (!user) {
        req.flash("fail", "Email hoặc mật khẩu không chính xác.");
        return res.redirect("back");
    }

    const confirm = await comparePassword(req.body.password, user.password.toString());
    if (!confirm) {
        req.flash("fail", "Email hoặc mật khẩu không chính xác.");
        return res.redirect("back");
    }

    generateToken(res, user.id, TOKEN_EXP, "token");

    req.flash("fail", `Đăng nhập thành công, xin chào ${user.fullName}.`);
    return res.redirect("/");
}

// [POST] /user/logout
export const postLogout = (req: Request, res: Response): void => {
    res.clearCookie("token");
    req.flash("success", "Đăng xuât thành công.");
    return res.redirect("/");
}