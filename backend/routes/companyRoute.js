import express from "express";
import {
  postInternship,
  deleteInternship,
  getApplications,
  updateInternship,
  accept,
  reject,
  postEvaluation,
  assignMentor,
  updateProfile,
  viewApplication,
} from "../controller/companyController.js";
const companyRoute = express.Router();

companyRoute.post("/postInternship", postInternship);
companyRoute.post("/evaluation/:id", postEvaluation);
companyRoute.delete("/deleteInternship/:id", deleteInternship);
companyRoute.put("/updateInternship/:id", updateInternship);
companyRoute.get("/getApplications", getApplications);
companyRoute.get("/viewApplication/:id", viewApplication);
companyRoute.put("/accept/:id", accept); //authStudent
companyRoute.put("/reject/:id", reject);
companyRoute.post("/assignMentor", assignMentor);
companyRoute.put("/updateProfile", updateProfile);

export default companyRoute;
