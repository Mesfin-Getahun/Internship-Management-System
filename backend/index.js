import dotenv from "dotenv";
dotenv.config();
import { setupSwagger } from "./utils/swagger.js";
import express from "express";
import cors from "cors";
import studentRoute from "./routes/studentRoute.js";
import adminDashboardRoute from "./routes/adminDashboardRoute.js";
import mentorRoute from "./routes/mentorRoute.js";
import facultyRoute from "./routes/facultyRoute.js";
import UILroute from "./routes/UILroute.js";
import companyRoute from "./routes/companyRoute.js";
import companyMentorRoute from "./routes/companyMentorRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import { startCompanyMentorFeedbackReminderJob } from "./utils/companyMentorFeedbackReminder.js";
import {
  registerStudent,
} from "./middleware/register.js";
import { checkMaintenanceMode } from "./middleware/Maintenance.js";
import {
  authLimiter,
  globalLimiter,
  securityHeaders,
} from "./middleware/security.js";

import router from "./middleware/login.js";
import changeRouter from "./middleware/changePassword.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in Backend/.env");
}

const app = express();

const allowedOrigins = new Set(
  String(
    process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:5173",
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(securityHeaders);
setupSwagger(app);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(globalLimiter);
app.use(express.json({ limit: "1mb" }));

app.use(checkMaintenanceMode);

app.use("/api/student", studentRoute);
app.use("/api/faculty", facultyRoute);
app.use("/api/mentor", mentorRoute);
app.use("/api/company", companyRoute);
app.use("/api/company_mentor", companyMentorRoute);
app.use("/api/UIL", UILroute);
app.use("/api/admin", adminDashboardRoute);
app.use("/api/notifications", notificationRoute);

app.use("/api/registerStudent", registerStudent);

app.use("/api/login", authLimiter, router);
app.use("/api/change-password", authLimiter, changeRouter);

app.use((err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin is not allowed",
    });
  }

  if (err.type === "entity.too.large" || err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "Request body or uploaded file is too large",
    });
  }

  if (
    err.code?.startsWith?.("LIMIT_") ||
    err.message === "Unsupported file type"
  ) {
    return res.status(400).json({
      success: false,
      message: err.message || "Invalid upload",
    });
  }

  console.error("Unhandled request error:", err);
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.statusCode ? err.message : "Server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCompanyMentorFeedbackReminderJob();
});
