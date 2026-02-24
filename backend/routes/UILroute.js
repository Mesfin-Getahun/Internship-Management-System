import express from "express";
import {
  acceptCompany,
  rejectCompany,
  allInternships,
  rejectInternship,
  approveInternship,
  pendingInternships,
  companyRequest,
  getActiveCompanies,
} from "../controller/UILcontroller.js";

const UILroute = express.Router();

UILroute.get("/internships", allInternships);
UILroute.get("/internships/pending", pendingInternships);
UILroute.get("/companyRequest", companyRequest);
UILroute.put("/rejectInternship/:internship_id", rejectInternship);
UILroute.put("/approveInternship/:internship_id", approveInternship);
UILroute.put("/acceptCompany/:company_id", acceptCompany);
UILroute.put("/rejectCompany/:company_id", rejectCompany);
UILroute.get("/companies/active", getActiveCompanies);

export default UILroute;
