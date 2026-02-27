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
  registerCompany,
} from "../controller/companyController.js";
import { authCompany } from "../middleware/auth.js";
import multer from "multer";

const companyRoute = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

companyRoute.post(
  "/register",
  upload.fields([
    { name: "profileFile", maxCount: 1 },
    { name: "licenseFile", maxCount: 1 },
  ]),
  registerCompany
);
companyRoute.post("/postInternship", authCompany, postInternship);
companyRoute.post("/evaluation/:internship_id", authCompany, postEvaluation);
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
