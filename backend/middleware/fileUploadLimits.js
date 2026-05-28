import multer from "multer";

const storage = multer.memoryStorage();
const MB = 1024 * 1024;

const allowedMimeTypes = {
  pdf: new Set(["application/pdf"]),
  image: new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]),
  supportingDocument: new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "text/plain",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

const companyDocumentFileFilter = (req, file, cb) => {
  if (file.fieldname === "profileFile") {
    if (allowedMimeTypes.image.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error("Company profile must be an image file"));
    return;
  }

  if (file.fieldname === "licenseFile") {
    if (allowedMimeTypes.pdf.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error("Company license must be a PDF file"));
    return;
  }

  cb(new Error("Unsupported upload field"));
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
  fileFilter: companyDocumentFileFilter,
});

export const supportingDocumentUpload = multer({
  storage,
  limits: { fileSize: 5 * MB, files: 1 },
  fileFilter: fileFilterFor(allowedMimeTypes.supportingDocument),
});

export const spreadsheetUpload = multer({
  storage,
  limits: { fileSize: 3 * MB, files: 1 },
  fileFilter: fileFilterFor(allowedMimeTypes.spreadsheet),
});
