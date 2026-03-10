import express from "express";
import {
  giveFeedBack,
  fetchStudents,
} from "../controller/companyMentorController.js";
import { authenticate } from "../middleware/auth.js";
const companyMentorRoute = express.Router();

companyMentorRoute.post(
  "/feedBack/:internship_id/:student_id",
  authenticate("company_mentor"),
  giveFeedBack
);
companyMentorRoute.get(
  "/students",
  authenticate("company_mentor"),
  fetchStudents
);

export default companyMentorRoute;
