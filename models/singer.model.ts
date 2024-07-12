import mongoose from "mongoose";
import slug from "mongoose-slug-updater";

mongoose.plugin(slug);

const singerSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        avatar: { type: String, required: true },
        status: { type: String, required: true },
        slug: { type: String, slug: "fullName", unique: true },
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

const Singer = mongoose.model("Singer", singerSchema, "singers");

export default Singer;