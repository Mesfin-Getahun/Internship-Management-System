import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// export const uploadToCloudinary = (buffer, folder) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder, resource_type: "raw" },
//       (err, result) => {
//         if (err) reject(err);
//         else resolve(result.secure_url);
//       }
//     );

//     streamifier.createReadStream(buffer).pipe(stream);
//   });
// };

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
