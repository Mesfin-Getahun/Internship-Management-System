import express from "express";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  resolveRecipient,
} from "../controller/notificationController.js";

const notificationRoute = express.Router();

notificationRoute.use(resolveRecipient);
notificationRoute.get("/", getNotifications);
notificationRoute.patch("/read-all", markAllNotificationsRead);
notificationRoute.patch("/:notification_id/read", markNotificationRead);

export default notificationRoute;
