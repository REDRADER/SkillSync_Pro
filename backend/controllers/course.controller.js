import CatchAsyncError from "../middlewares/catchAsyncError.middleware.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
import {
	createCourse,
	getAllCoursesService
} from "../services/course.service.js";
import CourseModel from "../models/course.model.js";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail.js";
import { NotificationModel } from "../models/notification.model.js";
import axios from "axios";

// upload course
export const uploadCourse = CatchAsyncError(async (req, res, next) => {
	try {
		const data = req.body;
		const thumbnail = data.thumbnail;
		if (thumbnail) {
			const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
				folder: "courses"
			});

			data.thumbnail = {
				public_id: myCloud.public_id,
				url: myCloud.secure_url
			};
		}
		createCourse(data, res, next);
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

// edit course
export const editCourse = CatchAsyncError(async (req, res, next) => {
	try {
		const data = req.body;

		const thumbnail = data.thumbnail;

		const courseId = req.params.id;

		const courseData = await CourseModel.findById(courseId);

		if (thumbnail && !thumbnail.startsWith("https")) {
			await cloudinary.v2.uploader.destroy(
				courseData.thumbnail.public_id
			);

			const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
				folder: "courses"
			});

			data.thumbnail = {
				public_id: myCloud.public_id,
				url: myCloud.secure_url
			};
		}

		if (thumbnail.startsWith("https")) {
			data.thumbnail = {
				public_id: courseData?.thumbnail.public_id,
				url: courseData?.thumbnail.url
			};
		}

		const course = await CourseModel.findByIdAndUpdate(
			courseId,
			{
				$set: data
			},
			{ new: true }
		);
		await redis.set(courseId, JSON.stringify(course)); // update course in redis
		res.status(201).json({
			success: true,
			course
		});
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

// get single course --- without purchasing
export const getSingleCourse = CatchAsyncError(async (req, res, next) => {
	try {
		const courseId = req.params.id;

		const isCacheExist = await redis.get(courseId);

		if (isCacheExist) {
			const course = JSON.parse(isCacheExist);
			res.status(200).json({
				success: true,
				course
			});
		} else {
			const course = await CourseModel.findById(req.params.id).select(
				"-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
			);

			await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days

			res.status(200).json({
				success: true,
				course
			});
		}
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

// get all courses --- without purchasing
export const getAllCourses = CatchAsyncError(async (req, res, next) => {
	try {
		const courses = await CourseModel.find().select(
			"-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
		);

		res.status(200).json({
			success: true,
			courses
		});
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

// get course content -- only for valid user
export const getCourseByUser = CatchAsyncError(async (req, res, next) => {
	try {
		const userCourseList = req.user?.courses;
		const courseId = req.params.id;

		const courseExists = userCourseList?.find(
			(course) => course._id.toString() === courseId
		);

		if (!courseExists) {
			return next(
				new ErrorHandler(
					"You are not eligible to access this course",
					404
				)
			);
		}

		const course = await CourseModel.findById(courseId);

		const content = course?.courseData;

		res.status(200).json({
			success: true,
			content
		});
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

// add question in course
export const addQuestion = CatchAsyncError(async (req, res, next) => {
	try {
		const { question, courseId, contentId } = req.body;
		const course = await CourseModel.findById(courseId);

		if (!mongoose.Types.ObjectId.isValid(contentId)) {
			return next(new ErrorHandler("Invalid content id", 400));
		}

		const couseContent = course?.courseData?.find((item) =>
			item._id.equals(contentId)
		);

		if (!couseContent) {
			return next(new ErrorHandler("Invalid content id", 400));
		}

		// create a new question object
		const newQuestion = {
			user: req.user,
			question,
			questionReplies: []
		};

		// add this question to our course content
		couseContent.questions.push(newQuestion);

		await NotificationModel.create({
			user: req.user?._id,
			title: "New Question Received",
			message: `You have a new question in ${couseContent.title}`
		});

		// save the updated course
		await course?.save();

		res.status(200).json({
			success: true,
			course
		});
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

// add answer in course question
export const addAnwser = CatchAsyncError(async (req, res, next) => {
	try {
		const { answer, courseId, contentId, questionId } = req.body;

		const course = await CourseModel.findById(courseId);

		if (!mongoose.Types.ObjectId.isValid(contentId)) {
			return next(new ErrorHandler("Invalid content id", 400));
		}

		const couseContent = course?.courseData?.find((item) =>
			item._id.equals(contentId)
		);

		if (!couseContent) {
			return next(new ErrorHandler("Invalid content id", 400));
		}

		const question = couseContent?.questions?.find((item) =>
			item._id.equals(questionId)
		);

		if (!question) {
			return next(new ErrorHandler("Invalid question id", 400));
		}

		// create a new answer object
		const newAnswer = {
			user: req.user,
			answer,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		// add this answer to our course content
		question.questionReplies.push(newAnswer);

		await course?.save();

		if (req.user?._id === question.user._id) {
			// create a notification
			await NotificationModel.create({
				user: req.user?._id,
				title: "New Question Reply Received",
				message: `You have a new question reply in ${couseContent.title}`
			});
		} else {
			const data = {
				name: question.user.name,
				title: couseContent.title
			};

			const html = await ejs.renderFile(
				path.join(__dirname, "../mails/question-reply.ejs"),
				data
			);

			try {
				await sendMail({
					email: question.user.email,
					subject: "Question Reply",
					template: "question-reply.ejs",
					data
				});
			} catch (error) {
				return next(new ErrorHandler(error.message, 500));
			}
		}

		res.status(200).json({
			success: true,
			course
		});
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

// add review in course
export const addReview = CatchAsyncError(async (req, res, next) => {
	try {
		const userCourseList = req.user?.courses;

		const courseId = req.params.id;

		// check if courseId already exists in userCourseList based on _id
		const courseExists = userCourseList?.some(
			(course) => course._id.toString() === courseId.toString()
		);

		if (!courseExists) {
			return next(
				new ErrorHandler(
					"You are not eligible to access this course",
					404
				)
			);
		}

		const course = await CourseModel.findById(courseId);

		const { review, rating } = req.body;

		const reviewData = {
			user: req.user,
			rating,
			comment: review
		};

		course?.reviews.push(reviewData);

		let avg = 0;

		course?.reviews.forEach((rev) => {
			avg += rev.rating;
		});

		if (course) {
			course.ratings = avg / course.reviews.length;
		}

		await course?.save();

		await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days

		// create notification
		await NotificationModel.create({
			user: req.user?._id,
			title: "New Review Received",
			message: `${req.user?.name} has given a review in ${course?.name}`
		});

		res.status(200).json({
			success: true,
			course
		});
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

// add reply in review
export const addReplyToReview = CatchAsyncError(async (req, res, next) => {
	try {
		const { comment, courseId, reviewId } = req.body;

		const course = await CourseModel.findById(courseId);

		if (!course) {
			return next(new ErrorHandler("Course not found", 404));
		}

		const review = course?.reviews?.find(
			(rev) => rev._id.toString() === reviewId
		);

		if (!review) {
			return next(new ErrorHandler("Review not found", 404));
		}

		const replyData = {
			user: req.user,
			comment,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		if (!review.commentReplies) {
			review.commentReplies = [];
		}

		review.commentReplies?.push(replyData);

		await course?.save();

		await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days

		res.status(200).json({
			success: true,
			course
		});
	} catch (error) {
		return next(new ErrorHandler(error.message, 500));
	}
});

// get all courses --- only for admin
export const getAdminAllCourses = CatchAsyncError(async (req, res, next) => {
	try {
		getAllCoursesService(res);
	} catch (error) {
		return next(new ErrorHandler(error.message, 400));
	}
});

// Delete Course --- only for admin
export const deleteCourse = CatchAsyncError(async (req, res, next) => {
	try {
		const { id } = req.params;

		const course = await CourseModel.findById(id);

		if (!course) {
			return next(new ErrorHandler("course not found", 404));
		}

		await course.deleteOne({ id });

		await redis.del(id);

		res.status(200).json({
			success: true,
			message: "course deleted successfully"
		});
	} catch (error) {
		return next(new ErrorHandler(error.message, 400));
	}
});

// generate video url
export const generateVideoUrl = CatchAsyncError(async (req, res, next) => {
	try {
		const { videoId } = req.body;
		const response = await axios.post(
			`https://dev.vdocipher.com/api/videos/${videoId}/otp`,
			{ ttl: 300 },
			{
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`
				}
			}
		);
		res.json(response.data);
	} catch (error) {
		return next(new ErrorHandler(error.message, 400));
	}
});
