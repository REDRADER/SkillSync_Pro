import { apiSlice } from "../api/apiSlice";

export const notificationsApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getAllNotifications: builder.query({
			query: () => ({
				url: "get-all-notifications",
				method: "GET",
				credentials: "include"
			})
		}),
		updateNotificationStatus: builder.mutation({
			query: (id) => ({
				url: `/update-notification/${id}`,
				method: "PUT",
				credentials: "include"
			})
		})
	})
});

const { useGetAllNotificationsQuery, useUpdateNotificationStatusMutation } =
	notificationsApi;

export { useGetAllNotificationsQuery, useUpdateNotificationStatusMutation };
