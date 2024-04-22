import ErrorHandler from "../utils/errorHandler.js";
import CatchAsyncError from "../middlewares/catchAsyncError.middleware.js";
import generateLast12MothsData from "../utils/analytics.generator.js";
import userModel from "../models/user.model.js";
import CourseModel from "../models/course.model.js";
import { OrderModel } from "../models/order.model.js";

// get users analytics --- only for admin
export const getUsersAnalytics = CatchAsyncError(async (req, res, next) => {
	try {
		const users = await generateLast12MothsData(userModel);

		res.status(200).json({
			success: true,
			users
		});
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

// get courses analytics --- only for admin
export const getCoursesAnalytics = CatchAsyncError(async (req, res, next) => {
	try {
		const courses = await generateLast12MothsData(CourseModel);

		res.status(200).json({
			success: true,
			courses
		});
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

// get order analytics --- only for admin
export const getOrderAnalytics = CatchAsyncError(async (req, res, next) => {
	try {
		const orders = await generateLast12MothsData(OrderModel);

		res.status(200).json({
			success: true,
			orders
		});
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});
