"use client";
import React from "react";
import AdminSidebar from "../../../components/Admin/sidebar/AdminSidebar";
import Heading from "../../../utils/Heading";
import DashboardHeader from "../../../components/Admin/DashboardHeader";
import EditCourse from "../../../components/Admin/Course/EditCourse";

export default function page({ params }) {
	const id = params?.id;

	return (
		<div>
			<Heading
				title="Elearning - Admin"
				description="ELearning is a platform for students to learn and get help from teachers"
				keywords="Prograaming,MERN,Redux,Machine Learning"
			/>
			<div className="flex">
				<div className="1500px:w-[16%] w-1/5">
					<AdminSidebar />
				</div>
				<div className="w-[85%]">
					<DashboardHeader />
					<EditCourse id={id} />
				</div>
			</div>
		</div>
	);
}