import express from "express";
import {
  fetchStudents,
  provideFeedback,
  reviewReport,
  mentorSignReport,
  companyMentorFeedback,
  getSingleFeedback,
} from "../controller/mentorController.js";
import { authenticate } from "../middleware/auth.js";
import { uploadPDF } from "../middleware/uploadPDF.js";
const mentorRoute = express.Router();

mentorRoute.get("/students", authenticate("mentor"), fetchStudents);
mentorRoute.get("/reports", authenticate("mentor"), reviewReport);
mentorRoute.get(
  "/companyFeedback",
  authenticate("mentor"),
  companyMentorFeedback
);
mentorRoute.post(
  "/provideFeedback/:id",
  authenticate("mentor"),
  provideFeedback
);
mentorRoute.post(
  "/signReport/:report_id",
  authenticate("mentor"),
  uploadPDF.single("report"),
  mentorSignReport
);
mentorRoute.get(
  "/feedback/:feedback_id",
  authenticate("mentor"), // faculty mentor auth
  getSingleFeedback
);

export default mentorRoute;
