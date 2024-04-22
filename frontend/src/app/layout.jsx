"use client";
import "./globals.css";
import { Poppins } from "next/font/google";
import { Josefin_Sans } from "next/font/google";
import { ThemeProvider } from "./utils/theme-provider";
import { Toaster } from "react-hot-toast";
import Providers from "./Providers";
import { SessionProvider } from "next-auth/react";
import React, { useEffect } from "react";
import { useLoadUserQuery } from "../app/redux/features/api/apiSlice";
import Loader from "./components/Loader/Loader";
import socketIO from "socket.io-client";

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-Poppins"
});

const josefin = Josefin_Sans({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-Josefin"
});

export default function RootLayout({ children }) {
	return /*#__PURE__*/ React.createElement(
		"html",
		{
			lang: "en",
			suppressHydrationWarning: true
		},
		/*#__PURE__*/ React.createElement(
			"body",
			{
				className: `${poppins.variable} ${josefin.variable} !bg-white bg-no-repeat dark:bg-gradient-to-b dark:from-gray-900 dark:to-black duration-300`
			},
			/*#__PURE__*/ React.createElement(
				Providers,
				null,
				/*#__PURE__*/ React.createElement(
					SessionProvider,
					null,
					/*#__PURE__*/ React.createElement(
						ThemeProvider,
						{
							attribute: "class",
							defaultTheme: "system",
							enableSystem: true
						},
						/*#__PURE__*/ React.createElement(
							Custom,
							null,
							/*#__PURE__*/ React.createElement(
								"div",
								null,
								children
							)
						),
						/*#__PURE__*/ React.createElement(Toaster, {
							position: "top-center",
							reverseOrder: false
						})
					)
				)
			)
		)
	);
}

const Custom = ({ children }) => {
	const { isLoading } = useLoadUserQuery({});

	useEffect(() => {
		socketId.on("connection", () => {});
	}, []);

	return /*#__PURE__*/ React.createElement(
		React.Fragment,
		null,
		isLoading
			? /*#__PURE__*/ React.createElement(Loader, null)
			: /*#__PURE__*/ React.createElement("div", null, children)
	);
};
