import { styles } from "../../../app/styles/style";
import CoursePlayer from "../../../app/utils/CoursePlayer";
import {
	useAddAnswerInQuestionMutation,
	useAddNewQuestionMutation,
	useAddReplyInReviewMutation,
	useAddReviewInCourseMutation,
	useGetCourseDetailsQuery
} from "../../redux/features/courses/coursesApi";
import Image from "next/image";
import { format } from "timeago.js";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
	AiFillStar,
	AiOutlineArrowLeft,
	AiOutlineArrowRight,
	AiOutlineStar
} from "react-icons/ai";
import { BiMessage } from "react-icons/bi";
import { VscVerifiedFilled } from "react-icons/vsc";
import Ratings from "@/app/utils/Ratings";
import socketIO from "socket.io-client";
const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

export default function CourseContentMedia(props) {
	const [activeBar, setactiveBar] = useState(0);
	const [question, setQuestion] = useState("");
	const [review, setReview] = useState("");
	const [rating, setRating] = useState(1);
	const [answer, setAnswer] = useState("");
	const [questionId, setQuestionId] = useState("");
	const [reply, setReply] = useState("");
	const [reviewId, setReviewId] = useState("");
	const [isReviewReply, setIsReviewReply] = useState(false);

	const [
		addNewQuestion,
		{ isSuccess, error, isLoading: questionCreationLoading }
	] = useAddNewQuestionMutation();
	const { data: courseData, refetch: courseRefetch } =
		useGetCourseDetailsQuery(props.id, { refetchOnMountOrArgChange: true });
	const [
		addAnswerInQuestion,
		{
			isSuccess: answerSuccess,
			error: answerError,
			isLoading: answerCreationLoading
		}
	] = useAddAnswerInQuestionMutation();
	const course = courseData?.course;
	const [
		addReviewInCourse,
		{
			isSuccess: reviewSuccess,
			error: reviewError,
			isLoading: reviewCreationLoading
		}
	] = useAddReviewInCourseMutation();

	const [
		addReplyInReview,
		{
			isSuccess: replySuccess,
			error: replyError,
			isLoading: replyCreationLoading
		}
	] = useAddReplyInReviewMutation();

	const isReviewExists = course?.reviews?.find(
		(item) => item.user._id === props.user._id
	);

	const handleQuestion = () => {
		if (question.length === 0) {
			toast.error("Question can't be empty");
		} else {
			addNewQuestion({
				question,
				courseId: props.id,
				contentId: props.data[props.activeVideo]._id
			});
		}
	};

	useEffect(() => {
		if (isSuccess) {
			setQuestion("");
			props.refetch();
			socketId.emit("notification", {
				title: `New Question Received`,
				message: `You have a new question in ${
					props.data[props.activeVideo].title
				}`,
				userId: props.user._id
			});
		}
		if (answerSuccess) {
			setAnswer("");
			props.refetch();
			if (props.user.role !== "admin") {
				socketId.emit("notification", {
					title: `New Reply Received`,
					message: `You have a new question in ${
						props.data[props.activeVideo].title
					}`,
					userId: props.user._id
				});
			}
		}
		if (error) {
			if ("data" in error) {
				const errorMessage = error;
				toast.error(errorMessage.data.message);
			}
		}
		if (answerError) {
			if ("data" in answerError) {
				const errorMessage = error;
				toast.error(errorMessage.data.message);
			}
		}
		if (reviewSuccess) {
			setReview("");
			setRating(1);
			courseRefetch();
			socketId.emit("notification", {
				title: `New Question Received`,
				message: `You have a new question in ${
					props.data[props.activeVideo].title
				}`,
				userId: props.user._id
			});
		}
		if (reviewError) {
			if ("data" in reviewError) {
				const errorMessage = error;
				toast.error(errorMessage.data.message);
			}
		}
		if (replySuccess) {
			setReply("");
			courseRefetch();
		}
		if (replyError) {
			if ("data" in replyError) {
				const errorMessage = error;
				toast.error(errorMessage.data.message);
			}
		}
	}, [
		isSuccess,
		error,
		answerSuccess,
		answerError,
		reviewSuccess,
		reviewError,
		replySuccess,
		replyError
	]);

	const handleAnswerSubmit = () => {
		addAnswerInQuestion({
			answer,
			courseId: props.id,
			contentId: props.data[props.activeVideo]._id,
			questionId: questionId
		});
	};

	const handleReviewSubmit = async () => {
		if (review.length === 0) {
			toast.error("Review can't be empty");
		} else {
			addReviewInCourse({ review, rating, courseId: props.id });
		}
	};

	const handleReviewReplySubmit = () => {
		if (!replyCreationLoading) {
			if (reply === "") {
				toast.error("Reply can't be empty");
			} else {
				addReplyInReview({
					comment: reply,
					courseId: props.id,
					reviewId
				});
			}
		}
	};

	return (
		<div className="w-[95%] 800px:w-[86%] py-4 m-auto">
			<CoursePlayer
				title={props.data[props.activeVideo]?.title}
				videoUrl={props.data[props.activeVideo]?.videoUrl}
			/>
			<div className="w-full flex items-center justify-between my-3">
				<div
					className={`${
						styles.button
					} text-white  !w-[unset] !min-h-[40px] !py-[unset] ${
						props.activeVideo === 0 &&
						"!cursor-no-drop opacity-[.8]"
					}`}
					onClick={() =>
						setActiveVideo(
							props.activeVideo === 0 ? 0 : props.activeVideo - 1
						)
					}
				>
					<AiOutlineArrowLeft className="mr-2" />
					Prev Lesson
				</div>
				<div
					className={`${
						styles.button
					} !w-[unset] text-white  !min-h-[40px] !py-[unset] ${
						props.data.length - 1 === props.activeVideo &&
						"!cursor-no-drop opacity-[.8]"
					}`}
					onClick={() =>
						setActiveVideo(
							props.data &&
								props.data.length - 1 === props.activeVideo
								? props.activeVideo
								: props.activeVideo + 1
						)
					}
				>
					Next Lesson
					<AiOutlineArrowRight className="ml-2" />
				</div>
			</div>
			<h1 className="pt-2 text-[25px] font-[600] dark:text-white text-black ">
				{props.data[props.activeVideo].title}
			</h1>
			<br />
			<div className="w-full p-4 flex items-center justify-between bg-slate-500 bg-opacity-20 backdrop-blur shadow-[bg-slate-700] rounded shadow-inner">
				{["Overview", "Resources", "Q&A", "Reviews"].map(
					(text, index) => (
						<h5
							key={index}
							className={`800px:text-[20px] cursor-pointer ${
								activeBar === index
									? "text-red-500"
									: "dark:text-white text-black"
							}`}
							onClick={() => setactiveBar(index)}
						>
							{text}
						</h5>
					)
				)}
			</div>
			<br />
			{activeBar === 0 && (
				<p className="text-[18px] whitespace-pre-line mb-3 dark:text-white text-black">
					{props.data[props.activeVideo]?.description}
				</p>
			)}

			{activeBar === 1 && (
				<div>
					{props.data[props.activeVideo]?.links.map((item, index) => (
						<div className="mb-5" key={index}>
							<h2 className="800px:text-[20px] 800px:inline-block dark:text-white text-black">
								{item.title && item.title + " :"}
							</h2>
							<a
								className="inline-block text-[#4395c4] 800px:text-[20px] 800px:pl-2"
								href={item.url}
							>
								{item.url}
							</a>
						</div>
					))}
				</div>
			)}

			{activeBar === 2 && (
				<>
					<div className="flex w-full">
						<Image
							src={
								props.user.avatar
									? props.user.avatar.url
									: "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png"
							}
							width={50}
							height={50}
							alt=""
							className="w-[50px] h-[50px] rounded-full object-cover"
						/>
						<textarea
							name=""
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
							id=""
							cols={40}
							rows={5}
							placeholder="Write your question..."
							className="outline-none bg-transparent ml-3 border dark:text-white text-black border-[#0000001d] dark:border-[#ffffff57] 800px:w-full p-2 rounded w-[90%] 800px:text-[18px] font-Poppins"
						></textarea>
					</div>
					<div className="w-full flex justify-end">
						<div
							className={`${
								styles.button
							} !w-[120px] !h-[40px] text-[18px] mt-5 ${
								questionCreationLoading && "cursor-not-allowed"
							}`}
							onClick={
								questionCreationLoading
									? () => {}
									: handleQuestion
							}
						>
							Submit
						</div>
					</div>
					<br />
					<br />
					<div className="w-full h-[1px] bg-[#ffffff3b]"></div>
					<div>
						<CommentReply
							data={props.data}
							activeVideo={props.activeVideo}
							answer={answer}
							setAnswer={setAnswer}
							handleAnswerSubmit={handleAnswerSubmit}
							user={props.user}
							questionId={questionId}
							setQuestionId={setQuestionId}
							answerCreationLoading={answerCreationLoading}
						/>
					</div>
				</>
			)}

			{activeBar === 3 && (
				<div className="w-full">
					<>
						{!isReviewExists && (
							<>
								<div className="flex w-full">
									<Image
										src={
											props.user.avatar
												? props.user.avatar.url
												: "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png"
										}
										width={50}
										height={50}
										alt=""
										className="w-[50px] h-[50px] rounded-full object-cover"
									/>
									<div className="w-full">
										<h5 className="pl-3 text-[20px] font-[500] dark:text-white text-black ">
											Give a Rating{" "}
											<span className="text-red-500">
												*
											</span>
										</h5>
										<div className="flex w-full ml-2 pb-3">
											{[1, 2, 3, 4, 5].map((i) =>
												rating >= i ? (
													<AiFillStar
														key={i}
														className="mr-1 cursor-pointer"
														color="rgb(246,186,0)"
														size={25}
														onClick={() =>
															setRating(i)
														}
													/>
												) : (
													<AiOutlineStar
														key={i}
														className="mr-1 cursor-pointer"
														color="rgb(246,186,0)"
														size={25}
														onClick={() =>
															setRating(i)
														}
													/>
												)
											)}
										</div>
										<textarea
											name=""
											value={review}
											onChange={(e) =>
												setReview(e.target.value)
											}
											id=""
											cols={40}
											rows={5}
											placeholder="Write your comment..."
											className="outline-none bg-transparent 800px:ml-3 dark:text-white text-black border border-[#00000027] dark:border-[#ffffff57] w-[95%] 800px:w-full p-2 rounded text-[18px] font-Poppins"
										></textarea>
									</div>
								</div>
								<div className="w-full flex justify-end">
									<div
										className={`${
											styles.button
										} !w-[120px] !h-[40px] text-[18px] mt-5 800px:mr-0 mr-2 ${
											reviewCreationLoading &&
											"cursor-no-drop"
										}`}
										onClick={
											reviewCreationLoading
												? () => {}
												: handleReviewSubmit
										}
									>
										Submit
									</div>
								</div>
							</>
						)}
						<br />
						<div className="w-full h-[1px] bg-[#ffffff3b]"></div>
						<div className="w-full">
							{(
								course?.reviews && [...course.reviews].reverse()
							)?.map((item, index) => {
								return (
									<div
										className="w-full my-5 dark:text-white text-black"
										key={index}
									>
										<div className="w-full flex">
											<div>
												<Image
													src={
														item.user.avatar
															? item.user.avatar
																	.url
															: "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png"
													}
													width={50}
													height={50}
													alt=""
													className="w-[50px] h-[50px] rounded-full object-cover"
												/>
											</div>
											<div className="ml-2">
												<h1 className="text-[18px]">
													{item?.user.name}
												</h1>
												<Ratings rating={item.rating} />
												<p>{item.comment}</p>
												<small className="text-[#0000009e] dark:text-[#ffffff83]">
													{format(item.createdAt)} •
												</small>
											</div>
										</div>
										{props.user.role === "admin" &&
											item.commentReplies.length ===
												0 && (
												<span
													className={`${styles.label} !ml-10 cursor-pointer`}
													onClick={() => {
														setIsReviewReply(true);
														setReviewId(item._id);
													}}
												>
													Add Reply
												</span>
											)}

										{isReviewReply &&
											reviewId === item._id && (
												<div className="w-full flex relative">
													<input
														type="text"
														placeholder="Enter your reply..."
														value={reply}
														onChange={(e) =>
															setReply(
																e.target.value
															)
														}
														className="block 800px:ml-12 mt-2 outline-none bg-transparent border-b border-[#000] dark:border-[#fff] p-[5px] w-[95%]"
													/>
													<button
														type="submit"
														className="absolute right-0 bottom-1"
														onClick={
															handleReviewReplySubmit
														}
													>
														Submit
													</button>
												</div>
											)}

										{item.commentReplies.map((i, index) => (
											<div
												className="w-full flex 800px:ml-16 my-5"
												key={index}
											>
												<div className="w-[50px] h-[50px]">
													<Image
														src={
															i.user.avatar
																? i.user.avatar
																		.url
																: "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png"
														}
														width={50}
														height={50}
														alt=""
														className="w-[50px] h-[50px] rounded-full object-cover"
													/>
												</div>
												<div className="pl-2">
													<div className="flex items-center">
														<h5 className="text-[20px]">
															{i.user.name}
														</h5>{" "}
														<VscVerifiedFilled className="text-[#0095F6] ml-2 text-[20px]" />
													</div>
													<p>{i.comment}</p>
													<small className="text-[#ffffff83]">
														{format(i.createdAt)} •
													</small>
												</div>
											</div>
										))}
									</div>
								);
							})}
						</div>
					</>
				</div>
			)}
		</div>
	);
}

const CommentReply = ({
	data,
	activeVideo,
	answer,
	setAnswer,
	handleAnswerSubmit,
	questionId,
	setQuestionId,
	answerCreationLoading
}) => {
	return (
		<>
			<div className="w-full my-3">
				{data[activeVideo].questions.map((item, index) => (
					<CommentItem
						key={index}
						data={data}
						activeVideo={activeVideo}
						item={item}
						index={index}
						answer={answer}
						setAnswer={setAnswer}
						questionId={questionId}
						setQuestionId={setQuestionId}
						handleAnswerSubmit={handleAnswerSubmit}
						answerCreationLoading={answerCreationLoading}
					/>
				))}
			</div>
		</>
	);
};

const CommentItem = ({
	questionId,
	setQuestionId,
	item,
	answer,
	setAnswer,
	handleAnswerSubmit,
	answerCreationLoading
}) => {
	const [replyActive, setreplyActive] = useState(false);
	return (
		<>
			<div className="my-4">
				<div className="flex mb-2">
					<div>
						<Image
							src={
								item.user.avatar
									? item.user.avatar.url
									: "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png"
							}
							width={50}
							height={50}
							alt=""
							className="w-[50px] h-[50px] rounded-full object-cover"
						/>
					</div>
					<div className="pl-3 dark:text-white text-black">
						<h5 className="text-[20px]">{item?.user.name}</h5>
						<p>{item?.question}</p>
						<small className="text-[#0000009e] dark:text-[#ffffff83]">
							{format(item.createdAt)} •
						</small>
					</div>
				</div>
				<div className="w-full flex items-center">
					<textarea
						name=""
						value={answer}
						onChange={(e) => setAnswer(e.target.value)}
						id=""
						cols={40}
						rows={2}
						placeholder="Write your answer..."
						className="outline-none bg-transparent border border-[#00000027] dark:border-[#ffffff57] dark:text-white text-black w-[85%] p-2 rounded text-[18px] font-Poppins"
					></textarea>
					<div className="ml-auto">
						<div
							className={`text-[18px] ${
								styles.button
							} mt-5 !w-[120px] !h-[40px] ${
								answerCreationLoading && "cursor-not-allowed"
							}`}
							onClick={
								answerCreationLoading
									? () => {}
									: handleAnswerSubmit
							}
						>
							Submit
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
