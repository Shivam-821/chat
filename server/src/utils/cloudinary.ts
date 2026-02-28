import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_KEY!,
  api_secret: process.env.CLOUDINARY_SECRET!,
});


export const uploadToCloudinary = async (localFilePath: string) => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "chat-app/avatars",
    });
    
    fs.unlinkSync(localFilePath);
    return result;
  } catch (error) {
    
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};


export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
  }
};
