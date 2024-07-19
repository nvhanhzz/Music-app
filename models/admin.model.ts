import { default as mongoose } from "mongoose";
import Role from "./role.model";
import slug from "mongoose-slug-updater";

mongoose.plugin(slug);

const adminSchema = new mongoose.Schema(
    {
        "fullName": String,
        "email": String,
        "password": String,
        "avatar": String,
        "phone": String,
        "status": String,
        "roleId": { type: mongoose.Schema.Types.ObjectId, ref: Role },
        slug: { type: String, slug: "fullName", unique: true },
        "deleted": {
            type: Boolean,
            default: false
        },
        "createdBy": {
            "adminId": { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
            action: String,
            "createdAt": {
                type: Date,
                default: Date.now
            }
        },
        "deletedBy": {
            "adminId": { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
            "deletedAt": Date
        },
        "updatedBy": [
            {
                "adminId": { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
                "updatedAt": {
                    type: Date
                }
            }
        ]
    }
);

const Admin = mongoose.model("Admin", adminSchema, "admins");

export default Admin;