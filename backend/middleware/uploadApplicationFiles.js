import { applicationFilesUpload } from "./fileUploadLimits.js";

export const uploadApplicationFiles = applicationFilesUpload.fields([
  { name: "cv", maxCount: 1 },
  { name: "academic_doc", maxCount: 1 },
]);
