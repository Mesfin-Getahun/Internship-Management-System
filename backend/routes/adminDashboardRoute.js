import express from "express";
import { authAdmin } from "../middleware/auth.js";
import {
  getAdminProfile,
  getAdminOverview,
  getAllUsers,
  getFaculties,
  updateFaculty,
  deleteFaculty,
  updateMaintenanceMode,
  getSystemLogs,
  getPlatformMonitoring,
  getBackupHistory,
  exportAdminData,
  backupDatabase,
} from "../controller/adminDashboardController.js";

const adminDashboardRoute = express.Router();

adminDashboardRoute.use(authAdmin);

adminDashboardRoute.get("/profile", getAdminProfile);
adminDashboardRoute.get("/overview", getAdminOverview);
adminDashboardRoute.get("/users", getAllUsers);
adminDashboardRoute.get("/faculties", getFaculties);
adminDashboardRoute.put("/faculties/:faculty_id", updateFaculty);
adminDashboardRoute.delete("/faculties/:faculty_id", deleteFaculty);
adminDashboardRoute.put("/maintenance", updateMaintenanceMode);
adminDashboardRoute.get("/logs", getSystemLogs);
adminDashboardRoute.get("/monitoring", getPlatformMonitoring);
adminDashboardRoute.get("/backups", getBackupHistory);
adminDashboardRoute.get("/export/:dataType", exportAdminData);
adminDashboardRoute.post("/backup", backupDatabase);

export default adminDashboardRoute;
