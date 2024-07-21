import { default as mongoose } from "mongoose";

const generalSettingSchema = new mongoose.Schema(
    {
        websiteName: String,
        logo: String,
        phone: String,
        email: String,
        address: String,
        copyright: String
    },
    { timestamps: true }
);

const GeneralSetting = mongoose.model("GeneralSetting", generalSettingSchema, "general-setting");

export default GeneralSetting;