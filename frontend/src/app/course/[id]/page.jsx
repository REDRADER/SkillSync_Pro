"use client";
import React from "react";
import CourseDetailsPage from "../../components/Course/CourseDetailsPage";

export default function Page({ params }) {
	return (
		<div>
			<CourseDetailsPage id={params.id} />
		</div>
	);
}
