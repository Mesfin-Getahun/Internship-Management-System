// import express from "express";

// const adminRoute = express.Router();

// adminRoute.post("/changePassword");

// export default adminRoute;

import express from "express";
import authAdmin from "../middlewares/authAdmin.js";
import {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getSystemSettings,
  updateSystemSettings,
  updateMaintenanceMode,
  getSystemLogs,
  backupDatabase,
} from "../controllers/adminController.js";

const router = express.Router();

// 🔒 All routes require admin authentication
router.use(authAdmin);

/* ================= FREQ-30 ================= */
// Manage users & roles
// router.get("/users", getAllUsers);
// router.put("/users/:role/:id/role", updateUserRole);
// router.put("/users/:role/:id/status", toggleUserStatus);

/* ================= FREQ-31 ================= */
// System settings
// router.get("/settings", authAdmin, getSystemSettings);
// router.put("/settings", authAdmin, updateSystemSettings);
router.put("/maintenance", authAdmin, updateMaintenanceMode);

/* ================= FREQ-32 ================= */
// System monitoring
router.get("/logs", authAdmin, getSystemLogs);

/* ================= FREQ-33 ================= */
// Backup
router.post("/backup", authAdmin, backupDatabase);

export default router;
