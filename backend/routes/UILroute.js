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
import { authenticate } from "../middleware/auth.js";

const UILroute = express.Router();

UILroute.get("/internships", authenticate("UIL"), allInternships);
UILroute.get("/internships/pending", authenticate("UIL"), pendingInternships);
UILroute.get("/companyRequest", authenticate("UIL"), companyRequest);
UILroute.put(
  "/rejectInternship/:internship_id",
  authenticate("UIL"),
  rejectInternship
);
UILroute.put(
  "/approveInternship/:internship_id",
  authenticate("UIL"),
  approveInternship
);
UILroute.put("/acceptCompany/:company_id", authenticate("UIL"), acceptCompany);
UILroute.put("/rejectCompany/:company_id", authenticate("UIL"), rejectCompany);
UILroute.get("/companies/active", authenticate("UIL"), getActiveCompanies);

export default UILroute;
