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
  myApplication,
} from "../controller/studentController.js";
import { uploadApplicationFiles } from "../middleware/uploadApplicationFiles.js";
import { uploadPDF } from "../middleware/uploadPDF.js";
import { authenticate } from "../middleware/auth.js";
const studentRoute = express.Router();

studentRoute.post(
  "/applyInternship/:internship_id",
  authenticate("student"),
  uploadApplicationFiles,
  applyInternships
);
studentRoute.delete(
  "/cancelApplication/:id",
  authenticate("student"),
  cancelApplication
);
studentRoute.get("/internships", authenticate("student"), fetchInternships); //authStudent
studentRoute.get("/myInternship", authenticate("student"), myInternship);
studentRoute.get("/myApplication", authenticate("student"), myApplication);
studentRoute.get("/viewFeedbacks", authenticate("student"), feedbacks);
studentRoute.put("/updateProfile", authenticate("student"), updateProfile);
studentRoute.post(
  "/uploadReport/:internship_id",
  uploadPDF.single("report"),
  authenticate("student"),
  uploadInternshipReport
);
studentRoute.put(
  "/submitToFaculty/:report_id",
  authenticate("student"),
  submitSignedReportToFaculty
);

export default studentRoute;
