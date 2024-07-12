import { Request, Response } from "express";
import Topic from "../../models/topic.model";

enum ListStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}

// [GET] /topics
export const index = async (req: Request, res: Response): Promise<void> => {
    const topics = await Topic.find({
        deleted: false,
        status: ListStatus.ACTIVE
    });

    res.render("client/pages/topic/index", {
        pageTitle: "Topic",
        topics: topics
    });
}