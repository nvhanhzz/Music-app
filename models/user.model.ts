import mongoose from "mongoose";
import Song from "./song.model";
import slug from "mongoose-slug-updater";

mongoose.plugin(slug);

const userSchema: mongoose.Schema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        avatar: { type: String, required: true },
        slug: { type: String, slug: "fullName", unique: true },
        favoriteSong: [{
            songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
            addedAt: { type: Date, default: Date.now }
        }],
        status: { type: String, required: true },
        deleted: { type: Boolean, default: false },
        deletedBy: {
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
            deletedAt: Date
        },
        updatedBy: [
            {
                adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
                action: String,
                updatedAt: {
                    type: Date
                }
            }
        ]
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");

export default User;