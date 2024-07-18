import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import Admin from '../../models/admin.model';
import ListStatus from "../../enums/status.enum";

const verifyToken = (token: string, key: string): { id: string } | null => {
    try {
        return jwt.verify(token, key) as { id: string };
    } catch (err) {
        console.error('Error verifying token:', err);
        return null;
    }
}

interface CheckTokenOptions {
    tokenName: string;
    type?: string;
}

export const checkToken = (options: CheckTokenOptions = { tokenName: '' }) => {
    const { tokenName, type } = options;

    return async (req: Request & { [key: string]: any }, res: Response, next: NextFunction) => {
        if (!req.cookies || !req.cookies[tokenName]) {
            return next();
        }

        const token = req.cookies[tokenName];
        const key = process.env.JWT_SIGNATURE as string;
        const decoded = verifyToken(token, key);

        if (!decoded) {
            res.clearCookie(tokenName);
            return next();
        }

        try {
            const user = await Admin.findOne({
                _id: decoded.id,
                deleted: false,
                status: ListStatus.ACTIVE
            }).populate("roleId").select("-password");

            if (!user) {
                res.clearCookie(tokenName);
                return next();
            }

            if (type) {
                res.locals[type] = user;
            }

            return next();
        } catch (error) {
            console.error('Error finding user:', error);
            return;
        }
    };
};

export const isLoggedIn = (req: Request & { currentAdmin?: object }, res: Response, next: NextFunction) => {
    if (!res.locals.currentAdmin) {
        req.flash('fail', 'Bạn cần đăng nhập trước.');
        const prefixAdmin = process.env.PATH_ADMIN;
        return res.redirect(`${prefixAdmin}/auth/login`);
    }
    return next();
}

export const isLoggedOut = (req: Request & { currentAdmin?: object }, res: Response, next: NextFunction) => {
    if (res.locals.currentAdmin) {
        req.flash('fail', 'Bạn đã đăng nhập rồi.');
        const prefixAdmin = process.env.PATH_ADMIN;
        return res.redirect(`${prefixAdmin}/dashboard`);
    }
    return next();
}