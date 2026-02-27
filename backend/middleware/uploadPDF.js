import multer from "multer";

const storage = multer.memoryStorage();

export const uploadPDF = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  },
});

// import multer from "multer";
// import cloudinary from "../config/cloudinary.js";
// import streamifier from "streamifier";

// const storage = multer.memoryStorage();

// export const uploadApplicationFiles = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// }).fields([
//   { name: "cv", maxCount: 1 },
//   { name: "academic_doc", maxCount: 1 },
// ]);

// // helper function to upload to cloudinary
// export const uploadToCloudinary = (fileBuffer, folder) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder,
//         resource_type: "raw",
//       },
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result);
//       }
//     );

//     streamifier.createReadStream(fileBuffer).pipe(stream);
//   });
// };

// streamifier is a small Node.js utility that converts a Buffer into a readable stream.

// In simple words:

// It lets you stream data that’s already in memory as if it were a file.

// 📦 Why do we need it in your case?
// Your situation:

// Multer uses memoryStorage

// Uploaded files are stored in:

// req.files.cv[0].buffer

// Cloudinary expects a stream or file path

// ❌ Cloudinary cannot upload a Buffer directly
// ✅ It can upload a stream

// ➡️ streamifier bridges that gap

// 🔁 Without vs With streamifier
// ❌ Without streamifier (won’t work)
// cloudinary.uploader.upload(req.files.cv[0].buffer);

// ✅ With streamifier (works)
// streamifier.createReadStream(req.files.cv[0].buffer)
//   .pipe(cloudinary.uploader.upload_stream(...));

// 🔧 What streamifier actually does
// streamifier.createReadStream(buffer)

// Takes a Buffer

// Converts it into a Readable Stream

// Allows .pipe() into another stream (Cloudinary upload)

// 🧪 Simple mental model

// Think of it like this:

// “I have a file in RAM, but Cloudinary wants a file stream.
// streamifier turns RAM data into a flowing stream.”

// 📚 Real-world analogy

// Buffer → bottled water

// Stream → flowing tap water

// Cloudinary only drinks from the tap

// 🧠 One-line exam answer (perfect)

// “Streamifier converts a file buffer into a readable stream so it can be uploaded to Cloudinary using streaming APIs.”

// ⚠️ Is streamifier always needed?

// ❌ No

// You need it only when:

// Using multer.memoryStorage()

// Uploading to services that expect streams (Cloudinary, S3 streams)

// If you use:

// Local disk storage → ❌ not needed

// CloudinaryStorage (when it works) → ❌ not needed
