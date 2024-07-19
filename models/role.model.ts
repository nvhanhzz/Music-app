import { default as mongoose } from "mongoose";
import slug from "mongoose-slug-updater";

mongoose.plugin(slug);

const roleSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        permission: {
            type: Array,
            default: []
        },
        slug: { type: String, slug: "title", unique: true },
        deleted: {
            type: Boolean,
            default: false
        },
        createdBy: {
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
            createdAt: {
                type: Date,
                default: Date.now
            }
        },
        deletedBy: {
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
            deletedAt: Date
        },
        updatedBy: [
            {
                adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
                action: String,
                updatedAt: {
                    type: Date
                }
            }
        ]
    }
);

const Role = mongoose.model("Role", roleSchema, "roles");

export default Role;
