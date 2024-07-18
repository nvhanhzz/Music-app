import { Request, Response } from "express";
import User from "../../models/user.model";
import { hashPassword, comparePassword } from "../../helper/hashPassword";
import generateToken from '../../helper/generateToken';
import Song from '../../models/song.model';
import ListStatus from "../../enums/status.enum";
import ForgotPassword from "../../models/forgotPassword.model";
import { generateOTP } from "../../helper/generate";
import { sendMail } from "../../helper/senMail";

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
    req.body.avatar = "";
    req.body.favoriteSong = [];
    const newUser = new User(req.body);
    await newUser.save();

    generateToken(res, newUser.id, TOKEN_EXP, "token");

    req.flash("success", `Đăng ký thành công, xin chào ${newUser.fullName}.`);
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
    req.flash("success", "Đăng xuất thành công.");
    return res.redirect("/");
}

// [PATCH] /user/addFavoriteSong
export const addFavoriteSong = async (req: Request, res: Response): Promise<Response> => {
    try {
        const songId = req.body.songId;
        const user = res.locals.currentUser;
        const song = await Song.findOne({
            _id: songId,
            deleted: false,
            status: ListStatus.ACTIVE
        });
        if (!song) {
            return res.status(404).json({ message: "Song not found." });
        }

        const favoriteSongs = user.favoriteSong.map(item => item.songId.toString());
        if (favoriteSongs.includes(song._id.toString())) {
            user.favoriteSong = user.favoriteSong.filter(item => item.songId.toString() !== song._id.toString());
        } else {
            user.favoriteSong.push({ songId: song._id });
        }

        await user.save();
        return res.status(200).json({ song: user });
    } catch (error) {
        return res.status(404).json({ message: "Song not found or user not found." });
    }
}

// [GET] /user/password/forgot
export const getForgotPassword = (req: Request, res: Response): void => {
    res.render("client/pages/user/forgotPassword", {
        pageTitle: "Quên mật khẩu"
    });
}

// [POST] /user/password/forgot
export const postForgotPassword = async (req: Request, res: Response): Promise<void> => {
    const email = req.body.email;
    const existUser = await User.findOne({
        email: email,
        deleted: false,
        status: ListStatus.ACTIVE
    });
    if (!existUser) {
        req.flash("fail", "Không tìm thấy email hoặc tài khoản đã bị khóa.");
        return res.redirect("back");
    }

    // solve exist otp
    const existOtp = await ForgotPassword.findOne({
        email: email
    });
    if (existOtp) {
        req.flash("fail", "Đã gửi OTP đến email của bạn, vui lòng kiểm tra lại email.");
        return res.redirect("/user/password/verify-otp");
    }
    // end solve exist otp

    // create OTP
    const otp = generateOTP(8);
    const attemptsLeft = 5;
    const forgotPassword = new ForgotPassword({
        email: email,
        otp: otp,
        attemptsLeft: attemptsLeft
    });

    const save = await forgotPassword.save();
    if (!save) {
        req.flash("fail", "Đã có lỗi xảy ra, vui lòng thử lại.");
        return res.redirect("back");
    }
    // end create OTP

    // send mail
    const subject = `Mã OTP xác minh lấy lại mật khẩu`
    const html = `Mã OTP là <b>${otp}</b>. Thời hạn sử dụng là 3 phút. Lưu ý không được để lộ mã này.`
    sendMail(email, subject, html);
    // end send mail

    // create temp token
    const TEMP_TOKEN_EXP: number = parseInt(process.env.TEMP_TOKEN_EXP, 10);
    generateToken(res, existUser.id, TEMP_TOKEN_EXP, "verify_otp_token");
    // end create temp token

    req.flash("fail", "Đã gửi OTP đến email của bạn, vui lòng kiểm tra email.");
    return res.redirect("/user/password/verify-otp");
}

// [GET] /user/password/verify-otp
export const getVerifyOtp = (req: Request, res: Response): void => {
    if (!res.locals.userVerifyOtp) {
        return res.redirect("/");
    }
    const email = res.locals.userVerifyOtp.email;

    res.render("client/pages/user/verifyOtp", {
        pageTitle: "Xác thực mã OTP",
        email: email
    });
}

// [POST] /user/password/verify-otp
export const postVerifyOtp = async (req: Request, res: Response): Promise<void> => {
    const userVerifyOtp = res.locals.userVerifyOtp
    const email = userVerifyOtp.email;
    const otp = req.body.otp;
    const forgotPassword = await ForgotPassword.findOne({
        email: email
    });

    if (!forgotPassword) {
        req.flash("fail", "Xác thực không thành công");
        return res.redirect("back");
    }

    if (forgotPassword.attemptsLeft === 0) {
        const del = await ForgotPassword.deleteOne({
            email: email
        });
        if (!del) {
            req.flash("fail", "Đã có lỗi xảy ra, vui lòng thử lại.");
            return res.redirect("back");
        }
        res.clearCookie("verify_otp_token");

        req.flash("fail", "Bạn đã nhập sai 5 lần, vui lòng lấy mã OTP mới và thử lại.");
        return res.redirect("/");
    }

    if (otp !== forgotPassword.otp) {
        forgotPassword.attemptsLeft -= 1;
        await forgotPassword.save();
        req.flash("fail", "Mã OTP không chính xác.");
        return res.redirect("back");
    }

    const del = await ForgotPassword.deleteOne({
        email: email
    });
    if (!del) {
        req.flash("fail", "Đã có lỗi xảy ra, vui lòng thử lại.");
        return res.redirect("back");
    }

    res.clearCookie("verify_otp_token");
    const TEMP_TOKEN_EXP: number = parseInt(process.env.TEMP_TOKEN_EXP, 10);
    generateToken(res, userVerifyOtp.id, TEMP_TOKEN_EXP, "reset-password-token");
    req.flash("success", "Xác thực thành công, hãy đặt lại mật khẩu.");
    return res.redirect("/user/password/reset");
}

// [GET] /user/password/reset
export const getResetPassword = (req: Request, res: Response): void => {
    if (!res.locals.userResetPassword) {
        return res.redirect("/");
    }
    res.render("client/pages/user/resetPassword", {
        pageTitle: "Đặt lại mật khẩu"
    });
}

// [POST] /api/v1/user/password/reset
export const patchResetPassword = async (req: Request, res: Response): Promise<void> => {
    const userResetPassword = res.locals.userResetPassword;

    const password = await hashPassword(req.body.password);
    const reset = await User.updateOne(
        {
            _id: userResetPassword.id
        },
        {
            password: password
        }
    );

    if (!reset) {
        req.flash("fail", "Đã có lỗi xảy ra, vui lòng thử lại.");
        return res.redirect("back");
    }

    res.clearCookie("reset-password-token");
    const TOKEN_EXP: number = parseInt(process.env.TOKEN_EXP, 10);
    generateToken(res, userResetPassword.id, TOKEN_EXP, "token");
    req.flash("success", `Đặt lại mật khẩu thành công, xin chào ${userResetPassword.fullName}.`);
    res.redirect(`/`);
}

// [GET] /user/information
export const getInformation = (req: Request, res: Response): void => {
    res.render("client/pages/user/information", {
        pageTitle: "Thông tin cá nhân"
    })
}

// [GET] /user/update-infor
export const getUpdateInfor = (req: Request, res: Response): void => {
    res.render("client/pages/user/updateInformation", {
        pageTitle: "Cập nhật thông tin"
    })
}

export const patchUpdateInfor = async (req: Request, res: Response): Promise<void> => {
    if (!res.locals.currentUser) {
        return res.redirect("back");
    }

    if (req.body.file) {
        req.body.avatar = req.body.file;
    }

    const result = await User.updateOne(
        { _id: res.locals.currentUser._id },
        req.body
    );

    if (!result) {
        req.flash("fail", "Cập nhật thất bại, vui lòng thử lại.");
        return res.redirect("back");
    }

    req.flash("success", "Cập nhật thông tin thành công.");
    return res.redirect("back");
}