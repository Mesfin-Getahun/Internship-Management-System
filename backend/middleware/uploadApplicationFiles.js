import multer from "multer";

const storage = multer.memoryStorage();

export const uploadApplicationFiles = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "cv", maxCount: 1 },
  { name: "academic_doc", maxCount: 1 },
]);
