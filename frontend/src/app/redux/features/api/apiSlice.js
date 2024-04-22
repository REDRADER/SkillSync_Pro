import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";
import dotenv from "dotenv";
dotenv.config();

export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_SERVER_URI
	}),
	endpoints: (builder) => ({
		refreshToken: builder.query({
			query: (data) => ({
				url: "refresh",
				method: "GET",
				credentials: "include"
			})
		}),
		loadUser: builder.query({
			query: (data) => ({
				url: "me",
				method: "GET",
				credentials: "include"
			}),
			async onQueryStarted(arg, { queryFulfilled, dispatch }) {
				try {
					const result = await queryFulfilled;
					dispatch(
						userLoggedIn({
							accessToken: result.data.accessToken,
							user: result.data.user
						})
					);
				} catch (error) {
					console.log(error);
				}
			}
		})
	})
});

const { useRefreshTokenQuery, useLoadUserQuery } = apiSlice;

export { useRefreshTokenQuery, useLoadUserQuery };
