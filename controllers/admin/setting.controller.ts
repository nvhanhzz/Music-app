import GeneralSetting from "../../models/general-setting.model";
import { Request, Response } from "express";

// [GET] /admin/setting/general
export const index = async (req: Request, res: Response): Promise<void> => {
    const setting = await GeneralSetting.findOne({});
    res.render("admin/pages/setting/general", {
        pageTitle: "General setting",
        setting: setting ? setting : {}
    });
}

// [PATCH] /admin/setting/general
export const update = async (req: Request, res: Response): Promise<void> => {
    if (req.body.file) {
        req.body.logo = req.body.file;
    }
    const setting = await GeneralSetting.findOne({});
    if (!setting) {
        const newSetting = new GeneralSetting(req.body);
        await newSetting.save();
    } else {
        await GeneralSetting.updateOne(
            {},
            req.body
        );
    }

    req.flash("success", "Cập nhật thành công.");
    return res.redirect("back");
}