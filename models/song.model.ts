import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
import Singer from "./singer.model";
import Topic from "./topic.model";
import User from "./user.model";
import Admin from "./admin.model";

mongoose.plugin(slug);

const songSchema = new mongoose.Schema(
    {
        title: { type: String },
        avatar: { type: String },
        description: { type: String },
        singerId: { type: mongoose.Schema.Types.ObjectId, ref: Singer },
        topicId: { type: mongoose.Schema.Types.ObjectId, ref: Topic },
        like: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: User }] },
        lyrics: { type: String },
        audio: { type: String },
        listenCount: { type: Number },
        position: { type: Number },
        featured: { type: Boolean },
        status: { type: String },
        slug: { type: String, slug: "title", unique: true },
        deleted: { type: Boolean, default: false },
        deletedBy: { adminId: { type: mongoose.Schema.Types.ObjectId, ref: Admin }, deletedAt: Date },
        createdBy: {
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: Admin },
            createdAt: {
                type: Date,
                default: Date.now
            }
        },
        updatedBy: [
            {
                adminId: { type: mongoose.Schema.Types.ObjectId, ref: Admin },
                action: String,
                updatedAt: {
                    type: Date
                }
            }
        ]
    }
);

const Song = mongoose.model("Song", songSchema, "songs");

export default Song;
