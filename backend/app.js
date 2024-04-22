import dotenv from "dotenv";
import express from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "../backend/middlewares/error.middleware.js";
import { userRouter } from "./routes/user.route.js";
import { courseRouter } from "./routes/course.route.js";
import { orderRouter } from "./routes/order.route.js";
import notificationRouter from "./routes/notification.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import { layoutRouter } from "./routes/layout.route.js";
import { rateLimit } from "express-rate-limit";

dotenv.config();

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
// app.use(
// 	cors({
// 		origin: ["http://localhost:3000"],
// 		credentials: true
// 	})
// );
app.use(
	cors({
		origin: process.env.ORIGIN,
		credentials: true
	})
);

// api requests limit
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: "draft-7",
	legacyHeaders: false
});

// routes
app.use(
	"/api/v1",
	userRouter,
	orderRouter,
	courseRouter,
	notificationRouter,
	analyticsRouter,
	layoutRouter
);

// testing api
app.get("/", (req, res, next) => {
	res.status(200).json({
		succcess: true,
		message: "Backend is running"
	});
});

// unknown route
app.all("*", (req, res, next) => {
	const err = new Error(`Route ${req.originalUrl} not found`);
	err.statusCode = 404;
	next(err);
});

// middleware calls
app.use(limiter);
app.use(ErrorMiddleware);
