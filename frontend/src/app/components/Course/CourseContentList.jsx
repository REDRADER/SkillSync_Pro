import React, { useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { MdOutlineOndemandVideo } from "react-icons/md";

export default function CourseContentList(props) {
	const [visibleSections, setVisibleSections] = useState(new Set());

	const toggleSection = (section) => {
		const newVisibleSections = new Set(visibleSections);
		if (newVisibleSections.has(section)) {
			newVisibleSections.delete(section);
		} else {
			newVisibleSections.add(section);
		}
		setVisibleSections(newVisibleSections);
	};

	return (
		<div
			className={`mt-[15px] w-full ${
				!props.isDemo &&
				"ml-[-30px] min-h-screen sticky top-24 left-0 z-30"
			}`}
		>
			{props.data.map((section, sectionIndex) => {
				const isSectionVisible = visibleSections.has(section);

				const sectionVideos = props.data.filter(
					(item) => item.videoSection === section
				);

				const sectionVideoCount = sectionVideos.length;
				const sectionVideoLength = sectionVideos.reduce(
					(totalLength, item) => totalLength + item.videoLength,
					0
				);
				const sectionContentHours = sectionVideoLength / 60;

				return (
					<div
						className={`${
							!props.isDemo &&
							"border-b border-[#0000001c] dark:border-[#ffffff8e] pb-2"
						}`}
						key={section}
					>
						<div className="w-full flex">
							<div className="w-full flex justify-between items-center">
								<h2 className="text-[22px] text-black dark:text-white">
									{section}
								</h2>
								<button
									className="mr-4 cursor-pointer text-black dark:text-white"
									onClick={() => toggleSection(section)}
								>
									{isSectionVisible ? (
										<BsChevronUp size={20} />
									) : (
										<BsChevronDown size={20} />
									)}
								</button>
							</div>
						</div>
						<h5 className="text-black dark:text-white">
							{sectionVideoCount} Lessons ·{" "}
							{sectionVideoLength < 60
								? sectionVideoLength
								: sectionContentHours.toFixed(2)}{" "}
							{sectionVideoLength > 60 ? "hours" : "minutes"}
						</h5>
						<br />
						{isSectionVisible && (
							<div className="w-full">
								{sectionVideos.map((item, index) => {
									const videoIndex = index;
									const contentLength = item.videoLength / 60;
									return (
										<div
											className={`w-full ${
												videoIndex === props.activeVideo
													? "bg-slate-800"
													: ""
											} cursor-pointer transition-all p-2`}
											key={item._id}
											onClick={() =>
												props.isDemo
													? null
													: props?.setActiveVideo(
															videoIndex
													  )
											}
										>
											<div className="flex items-start">
												<div>
													<MdOutlineOndemandVideo
														size={25}
														className="mr-2"
														color="#1cdada"
													/>
												</div>
												<h1 className="text-[18px] inline-block break-words text-black dark:text-white">
													{item.title}
												</h1>
											</div>
											<h5 className="pl-8 text-black dark:text-white">
												{item.videoLength > 60
													? contentLength.toFixed(2)
													: item.videoLength}{" "}
												{item.videoLength > 60
													? "hours"
													: "minutes"}
											</h5>
										</div>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
