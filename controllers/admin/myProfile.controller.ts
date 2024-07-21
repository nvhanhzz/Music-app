import { Request, Response } from 'express';
const PATH_ADMIN = process.env.PATH_ADMIN;

// [GET] /admin/my-profile
export const index = (req: Request, res: Response): void => {
    const admin = res.locals.currentAdmin;
    res.render("admin/pages/myProfile/index", {
        pageTitle: "Thông tin cá nhân",
        admin: admin
    });
}