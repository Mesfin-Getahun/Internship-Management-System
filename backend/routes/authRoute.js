import express from "express";
import authenticateAuto from "../middleware/authenticateAuto.js";
import { getMe } from "../controller/getMe.js";

const authRoute = express.Router();
authRoute.get("/me", authenticateAuto, getMe);

export default authRoute;
