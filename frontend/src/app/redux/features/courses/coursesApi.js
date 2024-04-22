import { apiSlice } from "../api/apiSlice";

export const coursesApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		createCourse: builder.mutation({
			query: (data) => ({
				url: "create-course",
				method: "POST",
				body: data,
				credentials: "include"
			})
		}),
		getAllCourses: builder.query({
			query: () => ({
				url: "get-admin-courses",
				method: "GET",
				credentials: "include"
			})
		}),
		deleteCourse: builder.mutation({
			query: (id) => ({
				url: `delete-course/${id}`,
				method: "DELETE",
				credentials: "include"
			})
		}),
		editCourse: builder.mutation({
			query: ({ id, data }) => ({
				url: `edit-course/${id}`,
				method: "PUT",
				body: data,
				credentials: "include"
			})
		}),
		getUsersAllCourses: builder.query({
			query: () => ({
				url: "get-courses",
				method: "GET",
				credentials: "include"
			})
		}),
		getCourseDetails: builder.query({
			query: (id) => ({
				url: `get-course/${id}`,
				method: "GET",
				credentials: "include"
			})
		}),
		getCourseContent: builder.query({
			query: (id) => ({
				url: `get-course-content/${id}`,
				method: "GET",
				credentials: "include"
			})
		}),
		addNewQuestion: builder.mutation({
			query: ({ question, courseId, contentId }) => ({
				url: "add-question",
				body: {
					question,
					courseId,
					contentId
				},
				method: "PUT",
				credentials: "include"
			})
		}),
		addAnswerInQuestion: builder.mutation({
			query: ({ answer, courseId, contentId, questionId }) => ({
				url: "add-answer",
				body: {
					answer,
					courseId,
					contentId,
					questionId
				},
				method: "PUT",
				credentials: "include"
			})
		}),
		addReviewInCourse: builder.mutation({
			query: ({ review, rating, courseId }) => ({
				url: `add-review/${courseId}`,
				body: {
					review,
					rating
				},
				method: "PUT",
				credentials: "include"
			})
		}),
		addReplyInReview: builder.mutation({
			query: ({ comment, courseId, reviewId }) => ({
				url: `add-reply`,
				body: {
					comment,
					courseId,
					reviewId
				},
				method: "PUT",
				credentials: "include"
			})
		})
	})
});

const {
	useCreateCourseMutation,
	useGetAllCoursesQuery,
	useDeleteCourseMutation,
	useEditCourseMutation,
	useGetUsersAllCoursesQuery,
	useGetCourseDetailsQuery,
	useGetCourseContentQuery,
	useAddNewQuestionMutation,
	useAddAnswerInQuestionMutation,
	useAddReviewInCourseMutation,
	useAddReplyInReviewMutation
} = coursesApi;

export {
	useCreateCourseMutation,
	useGetAllCoursesQuery,
	useDeleteCourseMutation,
	useEditCourseMutation,
	useGetUsersAllCoursesQuery,
	useGetCourseDetailsQuery,
	useGetCourseContentQuery,
	useAddNewQuestionMutation,
	useAddAnswerInQuestionMutation,
	useAddReviewInCourseMutation,
	useAddReplyInReviewMutation
};
