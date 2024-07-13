import { Request, Response } from "express";

export const index = (req: Request, res: Response): void => {
    res.render("client/pages/home/index", {
        pageTitle: "Trang chủ"
    });
}