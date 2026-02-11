import express from "express";
import {
  acceptCompany,
  rejectCompany,
  allInternships,
  rejectInternship,
  approveInternship,
} from "../controller/UILcontroller.js";

const UILroute = express.Router();

UILroute.get("/internships", allInternships);
UILroute.put("/rejectInternship/:id", rejectInternship);
UILroute.put("/approveCompany/:id", approveInternship);
UILroute.put("/acceptCompany/:id", acceptCompany);
UILroute.put("/rejectCompany/:id", rejectCompany);

//authStudent

export default UILroute;
