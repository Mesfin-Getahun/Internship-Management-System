import multer from "multer";

const storage = multer.memoryStorage();
const MB = 1024 * 1024;

const allowedMimeTypes = {
  pdf: new Set(["application/pdf"]),
  imageOrPdf: new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]),
  spreadsheet: new Set([
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]),
};

const fileFilterFor = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Unsupported file type"));
};

export const pdfUpload = multer({
  storage,
  limits: { fileSize: 5 * MB, files: 1 },
  fileFilter: fileFilterFor(allowedMimeTypes.pdf),
});

export const applicationFilesUpload = multer({
  storage,
  limits: { fileSize: 5 * MB, files: 2 },
  fileFilter: fileFilterFor(allowedMimeTypes.pdf),
});

export const companyDocumentUpload = multer({
  storage,
  limits: { fileSize: 5 * MB, files: 2 },
  fileFilter: fileFilterFor(allowedMimeTypes.imageOrPdf),
});

export const spreadsheetUpload = multer({
  storage,
  limits: { fileSize: 3 * MB, files: 1 },
  fileFilter: fileFilterFor(allowedMimeTypes.spreadsheet),
});
