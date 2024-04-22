import express from "express";
import {
	authorizeRoles,
	isAutheticated
} from "../middlewares/auth.middleware.js";
import {
	getNotifications,
	updateNotification
} from "../controllers/notification.controller.js";

const notificationRoute = express.Router();

notificationRoute.get(
	"/get-all-notifications",
	isAutheticated,
	authorizeRoles("admin"),
	getNotifications
);

notificationRoute.put(
	"/update-notification/:id",
	isAutheticated,
	authorizeRoles("admin"),
	updateNotification
);

export default notificationRoute;
