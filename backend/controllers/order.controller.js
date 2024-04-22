import express from "express";
import CatchAsyncError from "../middlewares/catchAsyncError.middleware.js";
import ErrorHandler from "../utils/errorHandler.js";
import userModel from "../models/user.model.js";
import CourseModel from "../models/course.model.js";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail.js";
import { NotificationModel } from "../models/notification.model.js";
import { getAllOrdersService, newOrder } from "../services/order.service.js";
import { redis } from "../utils/redis.js";
import dotenv from "dotenv";
dotenv.config();
import stripePackage from "stripe";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

// create order
export const createOrder = CatchAsyncError(async (req, res, next) => {
	try {
		const { courseId, payment_info } = req.body;

		if (payment_info) {
			if ("id" in payment_info) {
				const paymentIntentId = payment_info.id;
				const paymentIntent = await stripe.paymentIntents.retrieve(
					paymentIntentId
				);

				if (paymentIntent.status !== "succeeded") {
					return next(
						new ErrorHandler("Payment not authorized!", 400)
					);
				}
			}
		}

		const user = await userModel.findById(req.user?._id);

		const courseExistInUser = user?.courses.some(
			(course) => course._id.toString() === courseId
		);

		if (courseExistInUser) {
			return next(
				new ErrorHandler("You have already purchased this course", 400)
			);
		}

		const course = await CourseModel.findById(courseId);

		if (!course) {
			return next(new ErrorHandler("Course not found", 404));
		}

		const data = {
			courseId: course._id,
			userId: user?._id,
			payment_info
		};

		const mailData = {
			order: {
				_id: course._id.toString().slice(0, 6),
				name: course.name,
				price: course.price,
				date: new Date().toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric"
				})
			}
		};

		const html = await ejs.renderFile(
			path.join(__dirname, "../mails/order-confirmation.ejs"),
			{ order: mailData }
		);

		try {
			if (user) {
				await sendMail({
					email: user.email,
					subject: "Order Confirmation",
					template: "order-confirmation.ejs",
					data: mailData
				});
			}
		} catch (error) {
			return next(new ErrorHandler(error.message, 500));
		}

		user?.courses.push(course?._id);

		await redis.set(req.user?._id, JSON.stringify(user));

		await user?.save();

		await NotificationModel.create({
			user: user?._id,
			title: "New Order",
			message: `You have a new order from ${course?.name}`
		});

		course.purchased = course.purchased + 1;

		await course.save();

		newOrder(data, res, next);
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

// get All orders --- only for admin
export const getAllOrders = CatchAsyncError(async (req, res, next) => {
	try {
		getAllOrdersService(res);
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

//  send stripe publishble key
export const sendStripePublishableKey = CatchAsyncError(async (req, res) => {
	res.status(200).json({
		publishablekey: process.env.STRIPE_PUBLISHABLE_KEY
	});
});

// new payment
export const newPayment = CatchAsyncError(async (req, res, next) => {
	try {
		const myPayment = await stripe.paymentIntents.create({
			amount: req.body.amount,
			currency: "USD",
			description: "E-learning course services",
			metadata: {
				company: "E-Learning"
			},
			automatic_payment_methods: {
				enabled: true
			},
			shipping: {
				name: "Harmik Lathiya",
				address: {
					line1: "510 Townsend St",
					postal_code: "98140",
					city: "San Francisco",
					state: "CA",
					country: "US"
				}
			}
		});
		res.status(201).json({
			success: true,
			client_secret: myPayment.client_secret
		});
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});
