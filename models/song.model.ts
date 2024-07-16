import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
import Singer from "./singer.model";
import Topic from "./topic.model";
import User from "./user.model";

mongoose.plugin(slug);

const songSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        avatar: { type: String, required: true },
        description: { type: String, required: true },
        singerId: { type: mongoose.Schema.Types.ObjectId, ref: Singer, required: true },
        topicId: { type: mongoose.Schema.Types.ObjectId, ref: Topic },
        like: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: User }], required: true },
        lyrics: { type: String, required: true },
        audio: { type: String, required: true },
        listenCount: { type: Number, require: true },
        position: { type: Number, require: true },
        featured: { type: Boolean, require: true },
        status: { type: String, required: true },
        slug: { type: String, slug: "title", unique: true },
        deleted: { type: Boolean, default: false },
        // sau sửa phần dưới, khi có model account. Và thêm phần ref
        // "deletedBy": { "accountId": String, "deletedAt": Date },
        // "createdBy": {
        //     "accountId": String,
        //     "createdAt": {
        //         type: Date,
        //         default: Date.now
        //     }
        // },
        // "updatedBy": [
        //     {
        //         "accountId": String,
        //         "updatedAt": {
        //             type: Date
        //         }
        //     }
        // ]
    }
);

const Song = mongoose.model("Song", songSchema, "songs");

export default Song;