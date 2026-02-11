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
UILroute.put("/rejectInternship/:id/reject", rejectInternship);
UILroute.put("/approveCompany/:id/approve", approveInternship);
UILroute.put("/acceptCompany/:id/approve", acceptCompany);
UILroute.put("/rejectCompany/:id/reject", rejectCompany);
UILroute.get("/companies/active", getActiveCompanies);

export default UILroute;
