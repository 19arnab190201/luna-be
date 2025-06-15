"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            folder: "prescriptions",
            resource_type: "auto",
        });
        return result.secure_url;
    }
    catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw new Error("Failed to upload image");
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
//# sourceMappingURL=cloudinary.js.map