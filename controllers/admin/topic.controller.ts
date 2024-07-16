import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import ListStatus from "../../enums/status.enum";

export const index = async (req: Request, res: Response): Promise<void> => {
    const topics = await Topic.find({
        deleted: false
    });

    res.render("admin/pages/topic/index", {
        pageTitle: "Chủ đề",
        topics: topics
    });
}