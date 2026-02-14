import express from "express";
import {
  applyInternships,
  fetchInternships,
  myInternship,
  uploadInternshipReport,
  feedbacks,
  updateProfile,
  cancelApplication,
  submitSignedReportToFaculty,
} from "../controller/studentController.js";
import { uploadApplicationFiles } from "../middleware/uploadApplicationFiles.js";
import { uploadPDF } from "../middleware/uploadPDF.js";
const studentRoute = express.Router();

studentRoute.post(
  "/applyInternship/:id",
  uploadApplicationFiles,
  applyInternships
);
studentRoute.delete("/cancelApplication/:id", cancelApplication);
studentRoute.get("/internships", fetchInternships); //authStudent
studentRoute.get("/myInternship", myInternship);
studentRoute.get("/viewFeedbacks", feedbacks);
studentRoute.put("/updateProfile", updateProfile);
studentRoute.post(
  "/uploadReport",
  uploadPDF.single("report"),
  uploadInternshipReport
);
studentRoute.put("/submitToFaculty/:report_id", submitSignedReportToFaculty);

export default studentRoute;
