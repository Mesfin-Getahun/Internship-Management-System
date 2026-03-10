import express from "express";
import {
  assignMentor,
  changeMentor,
  companyEvaluation,
  deleteMentor,
  getStudents,
  facultyViewReports,
  evaluation,
} from "../controller/facultyController.js";
import { authenticate } from "../middleware/auth.js";
const facultyRoute = express.Router();

facultyRoute.post("/assignMentor", authenticate("faculty"), assignMentor);
facultyRoute.get(
  "/companyEvaluation",
  authenticate("faculty"),
  companyEvaluation
);
facultyRoute.get("/students", authenticate("faculty"), getStudents);
facultyRoute.get(
  "/companyEvaluation/:evaluation_id",
  authenticate("faculty"),
  evaluation
);
facultyRoute.delete("/deleteMentor/:id", authenticate("faculty"), deleteMentor);
facultyRoute.put("/changeMentor/:id", authenticate("faculty"), changeMentor);
facultyRoute.get("/reports", authenticate("faculty"), facultyViewReports);
export default facultyRoute;
