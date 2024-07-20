import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
import Admin from "./admin.model";

mongoose.plugin(slug);

const singerSchema = new mongoose.Schema(
    {
        fullName: String,
        avatar: String,
        status: String,
        slug: { type: String, slug: "fullName", unique: true },
        featured: { type: Boolean, default: false },
        position: Number,
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

const Singer = mongoose.model("Singer", singerSchema, "singers");

export default Singer;