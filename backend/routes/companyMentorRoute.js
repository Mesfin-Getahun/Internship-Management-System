import express from "express";
import {
  giveFeedBack,
  fetchStudents,
} from "../controller/companyMentorController.js";
import { authCompanyMentor } from "../middleware/auth.js";
const companyMentorRoute = express.Router();

companyMentorRoute.post(
  "/feedBack/:internship_id/:student_id",
  authCompanyMentor,
  giveFeedBack
);
companyMentorRoute.get("/students", authCompanyMentor, fetchStudents);

export default companyMentorRoute;
