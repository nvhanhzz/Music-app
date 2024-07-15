import mongoose from "mongoose";
import Song from "./song.model";

const userSchema: mongoose.Schema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        avatar: { type: String, required: true },
        favoriteSong: [{
            songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
            addedAt: { type: Date, default: Date.now }
        }],
        status: { type: String, required: true },
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");

export default User;