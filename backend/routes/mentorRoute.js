import express from "express";
import {
  fetchStudents,
  provideFeedback,
  reviewReport,
  mentorSignReport,
  companyMentorFeedback,
  getSingleFeedback,
} from "../controller/mentorController.js";
import { authMentor } from "../middleware/auth.js";
import { uploadPDF } from "../middleware/uploadPDF.js";
const mentorRoute = express.Router();

mentorRoute.get("/students", authMentor, fetchStudents);
mentorRoute.get("/reports", authMentor, reviewReport);
mentorRoute.get("/companyFeedback", authMentor, companyMentorFeedback);
mentorRoute.post("/provideFeedback/:id", authMentor, provideFeedback);
mentorRoute.post(
  "/signReport/:report_id",
  authMentor,
  uploadPDF.single("report"),
  mentorSignReport
);
mentorRoute.get(
  "/feedback/:feedback_id",
  authMentor, // faculty mentor auth
  getSingleFeedback
);

export default mentorRoute;
