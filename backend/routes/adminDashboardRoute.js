import express from "express";
import { authAdmin } from "../middleware/auth.js";
import {
  getAdminProfile,
  getAdminOverview,
  getAllUsers,
  resetUserPassword,
  updateMaintenanceMode,
  getSystemLogs,
  getPlatformMonitoring,
  getBackupHistory,
  backupDatabase,
} from "../controller/adminDashboardController.js";
import { expensiveActionLimiter } from "../middleware/security.js";

const adminDashboardRoute = express.Router();

adminDashboardRoute.use(authAdmin);

adminDashboardRoute.get("/profile", getAdminProfile);
adminDashboardRoute.get("/overview", getAdminOverview);
adminDashboardRoute.get("/users", getAllUsers);
adminDashboardRoute.post("/users/:role/:id/reset-password", expensiveActionLimiter, resetUserPassword);
adminDashboardRoute.put("/maintenance", updateMaintenanceMode);
adminDashboardRoute.get("/logs", getSystemLogs);
adminDashboardRoute.get("/monitoring", getPlatformMonitoring);
adminDashboardRoute.get("/backups", getBackupHistory);
adminDashboardRoute.post("/backup", expensiveActionLimiter, backupDatabase);

export default adminDashboardRoute;
