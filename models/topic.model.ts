import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
import Admin from "./admin.model";

mongoose.plugin(slug);

const topicSchema = new mongoose.Schema(
    {
        title: String,
        avatar: String,
        description: String,
        status: String,
        position: Number,
        slug: { type: String, slug: "title", unique: true },
        featured: { type: Boolean, default: false },
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

const Topic = mongoose.model("Topic", topicSchema, "topics");

export default Topic;