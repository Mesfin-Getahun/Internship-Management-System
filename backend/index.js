import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import studentRoute from "./routes/studentRoute.js";
//import adminRoute from "./routes/adminRoute.js";
import mentorRoute from "./routes/mentorRoute.js";
import facultyRoute from "./routes/facultyRoute.js";
import UILroute from "./routes/UILroute.js";
import companyRoute from "./routes/companyRoute.js";
//import companyMentorRoute from "./routes/companyMentorRoute.js";
import {
  registerStudent,
  createCompanyMentor,
  createFaculty,
  createMentor,
  registerCompany,
} from "./middleware/register.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/student", studentRoute);
app.use("/api/faculty", facultyRoute);
app.use("/api/mentor", mentorRoute);
app.use("/api/company", companyRoute);
//app.use("/api/company_mentor", companyMentorRoute);
app.use("/api/UIL", UILroute);
//app.use("/api/admin", adminRoute);

app.use("/api/registerStudent", registerStudent);
app.use("/api/registerMentor", createMentor);
app.use("/api/registerCompanyMentor", createCompanyMentor);
app.use("/api/registerCompany", registerCompany);
app.use("/api/registerFaculty", createFaculty);
//app.use("/api/registerUIL", UILroute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
