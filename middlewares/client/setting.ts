import GeneralSetting from "../../models/general-setting.model";
import { Request, Response, NextFunction } from "express";

export const generalSetting = async (req: Request, res: Response, next: NextFunction) => {
    const setting = await GeneralSetting.findOne({});
    res.locals.generalSetting = setting;
    return next();
}