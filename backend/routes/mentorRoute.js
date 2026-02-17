import express from "express";
import {
  fetchStudents,
  provideFeedback,
  reviewReport,
  mentorSignReport,
} from "../controller/mentorController.js";
import { authMentor } from "../middleware/auth.js";
import { uploadPDF } from "../middleware/uploadPDF.js";
const mentorRoute = express.Router();

mentorRoute.get("/students", authMentor, fetchStudents);
mentorRoute.get("/reports", reviewReport);
mentorRoute.post("/provideFeedback/:id", provideFeedback);
mentorRoute.post(
  "/signReport/:report_id",
  uploadPDF.single("report"),
  mentorSignReport
);

export default mentorRoute;
