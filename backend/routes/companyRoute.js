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
import { authenticate } from "../middleware/auth.js";
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
companyRoute.post("/postInternship", authenticate("company"), postInternship);
companyRoute.post("/evaluation/:internship_id", authenticate("company"), postEvaluation);
companyRoute.delete(
  "/deleteInternship/:internship_id",
  authenticate("company"),
  deleteInternship
);
companyRoute.put(
  "/updateInternship/:internship_id",
  authenticate("company"),
  updateInternship
);
companyRoute.get("/getApplications", authenticate("company"), getApplications);
companyRoute.get(
  "/viewApplication/:application_id",
  authenticate("company"),
  viewApplication
);
companyRoute.get("/activeInternships", authenticate("company"), activeInternships);
companyRoute.put("/accept/:application_id", authenticate("company"), accept);
companyRoute.put("/reject/:application_id", authenticate("company"), reject);
companyRoute.post("/assignMentor", authenticate("company"), assignMentor);
companyRoute.put("/updateProfile", authenticate("company"), updateProfile);

export default companyRoute;
