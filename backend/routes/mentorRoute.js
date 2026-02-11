import express from "express";
import {
  fetchStudents,
  provideFeedback,
  reviewReport,
} from "../controller/mentorController.js";
const mentorRoute = express.Router();

mentorRoute.get("/students", fetchStudents);
mentorRoute.get("/reports", reviewReport);
mentorRoute.post("/provideFeedback/:id", provideFeedback);

export default mentorRoute;
