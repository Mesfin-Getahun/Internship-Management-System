import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadToCloudinary = (buffer, folder, originalName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        public_id: originalName ? originalName.split(".")[0] : undefined, // keep name without extension
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// //import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

// // Upload LOCAL file (PDF, etc.)
// export const uploadToCloudinary = async (filePath, folder) => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder,
//       resource_type: "raw", // IMPORTANT for PDF
//
//     });

//     // Optional: delete local file after upload
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }

//     return result.secure_url;
//   } catch (error) {
//     throw new Error("Cloudinary upload failed: " + error.message);
//   }
// };
