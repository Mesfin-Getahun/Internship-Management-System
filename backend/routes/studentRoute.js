import express from "express";
import {
  applyInternships,
  fetchInternships,
  myInternship,
  uploadInternshipReport,
  feedbacks,
  updateProfile,
  cancelApplication,
} from "../controller/studentController.js";
import { uploadApplicationFiles } from "../middleware/uploadApplicationFiles.js";
const studentRoute = express.Router();

studentRoute.post(
  "/applyInternship/:id",
  uploadApplicationFiles,
  applyInternships
);
studentRoute.delete("/cancelApplication/:id", cancelApplication);
studentRoute.get("/internships", fetchInternships); //authStudent
studentRoute.get("/myInternship", myInternship);
studentRoute.post("/uploadReport", uploadInternshipReport);
studentRoute.get("/viewFeedbacks", feedbacks);
studentRoute.put("/updateProfile", updateProfile);

export default studentRoute;
