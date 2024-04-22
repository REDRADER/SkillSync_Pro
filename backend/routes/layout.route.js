import express from "express";
import {
	authorizeRoles,
	isAutheticated
} from "../middlewares/auth.middleware.js";
import {
	createLayout,
	editLayout,
	getLayoutByType
} from "../controllers/layout.controller.js";

const layoutRouter = express.Router();

layoutRouter.post(
	"/create-layout",
	isAutheticated,
	authorizeRoles("admin"),
	createLayout
);

layoutRouter.put(
	"/edit-layout",
	isAutheticated,
	authorizeRoles("admin"),
	editLayout
);

layoutRouter.get("/get-layout/:type", getLayoutByType);

export { layoutRouter };
