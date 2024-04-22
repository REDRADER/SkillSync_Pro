"use client";
import React, { useState } from "react";
import Protected from "../hooks/useProtected";
import Heading from "../utils/Heading";
import Header from "../components/Header";
import Profile from "../components/Profile/Profile";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";

export default function Page(props) {
	const [open, setOpen] = useState(false);
	const [activeItem, setActiveItem] = useState(5);
	const [route, setRoute] = useState("Login");
	const { user } = useSelector((state) => state.auth);

	return (
		<div className="min-h-screen">
			<Protected>
				<Heading
					title={`${user?.name} profile - Elearning`}
					description="ELearning is a platform for students to learn and get help from teachers"
					keywords="Prograaming,MERN,Redux,Machine Learning"
				/>
				<Header
					open={open}
					setOpen={setOpen}
					activeItem={activeItem}
					setRoute={setRoute}
					route={route}
				/>
				<Profile user={user} />
				<Footer />
			</Protected>
		</div>
	);
}
