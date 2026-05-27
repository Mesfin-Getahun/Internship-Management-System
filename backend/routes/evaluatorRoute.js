import express from "express";
import {
  getEvaluatorAssignments,
  getEvaluatorProfile,
  submitPresentationGrade,
} from "../controller/evaluatorController.js";
import { authEvaluator } from "../middleware/auth.js";

const evaluatorRoute = express.Router();

evaluatorRoute.get("/profile", authEvaluator, getEvaluatorProfile);
evaluatorRoute.get("/assignments", authEvaluator, getEvaluatorAssignments);
evaluatorRoute.put(
  "/assignments/:student_id/:internship_id/grade",
  authEvaluator,
  submitPresentationGrade,
);

export default evaluatorRoute;
