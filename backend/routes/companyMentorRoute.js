import express from "express";
import {
  giveFeedBack,
  fetchStudents,
} from "../controller/companyMentorController";

const companyMentorRoute = express.Router();

companyMentorRoute.post("/feedBack", giveFeedBack);
companyMentorRoute.get("/students", fetchStudents);

export default companyMentorRoute;
