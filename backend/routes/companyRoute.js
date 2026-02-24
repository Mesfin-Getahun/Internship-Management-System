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
  activeInternships,
} from "../controller/companyController.js";
import { authCompany } from "../middleware/auth.js";
const companyRoute = express.Router();

companyRoute.post("/postInternship", authCompany, postInternship);
companyRoute.post("/evaluation/:id", authCompany, postEvaluation);
companyRoute.delete(
  "/deleteInternship/:internship_id",
  authCompany,
  deleteInternship
);
companyRoute.put(
  "/updateInternship/:internship_id",
  authCompany,
  updateInternship
);
companyRoute.get("/getApplications", authCompany, getApplications);
companyRoute.get(
  "/viewApplication/:application_id",
  authCompany,
  viewApplication
);
companyRoute.get("/activeInternships", authCompany, activeInternships);
companyRoute.put("/accept/:application_id", authCompany, accept);
companyRoute.put("/reject/:application_id", authCompany, reject);
companyRoute.post("/assignMentor", authCompany, assignMentor);
companyRoute.put("/updateProfile", authCompany, updateProfile);

export default companyRoute;
