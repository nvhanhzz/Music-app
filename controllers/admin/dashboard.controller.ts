import { Request, Response } from "express";
import Song from "../../models/song.model";
import Role from "../../models/role.model";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";
import Admin from "../../models/admin.model";
import User from "../../models/user.model";

export const index = async (req: Request, res: Response): Promise<void> => {
    const currentAdmin = res.locals.currentAdmin;
    const permission = currentAdmin.roleId.permission;

    interface Statistics {
        quantity: number,
        active: number,
        inactive: number
    };

    const song: Statistics = {
        quantity: 0,
        active: 0,
        inactive: 0
    };
    if (permission.includes('view-song')) {
        song.quantity = await Song.countDocuments({});
        song.active = await Song.countDocuments({ status: "active" });
        song.inactive = song.quantity - song.active;
    }

    const topic: Statistics = {
        quantity: 0,
        active: 0,
        inactive: 0
    };
    if (permission.includes('view-topic')) {
        topic.quantity = await Topic.countDocuments({});
        topic.active = await Topic.countDocuments({ status: "active" });
        topic.inactive = topic.quantity - topic.active;
    }

    const singer: Statistics = {
        quantity: 0,
        active: 0,
        inactive: 0
    };
    if (permission.includes('view-singer')) {
        singer.quantity = await Singer.countDocuments({});
        singer.active = await Singer.countDocuments({ status: "active" });
        singer.inactive = singer.quantity - singer.active;
    }

    const admin: Statistics = {
        quantity: 0,
        active: 0,
        inactive: 0
    };
    if (permission.includes('view-admin')) {
        admin.quantity = await Admin.countDocuments({});
        admin.active = await Admin.countDocuments({ status: "active" });
        admin.inactive = admin.quantity - admin.active;
    }

    const user: Statistics = {
        quantity: 0,
        active: 0,
        inactive: 0
    };
    if (permission.includes('view-user')) {
        user.quantity = await User.countDocuments({});
        user.active = await User.countDocuments({ status: "active" });
        user.inactive = user.quantity - user.active;
    }

    const role = { quantity: 0 };
    if (permission.includes('view-role')) {
        role.quantity = await Role.countDocuments({ deleted: false });
    }

    res.render("admin/pages/dashboard/index", {
        pageTitle: "Tổng quan",
        currentAdmin: currentAdmin,
        singer: singer,
        topic: topic,
        song: song,
        admin: admin,
        user: user,
        role: role
    });
}