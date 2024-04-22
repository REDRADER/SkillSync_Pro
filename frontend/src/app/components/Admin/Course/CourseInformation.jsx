import React, { useEffect, useState } from "react";

export default function CourseInformation({
	courseInfo,
	setCourseInfo,
	active,
	setActive
}) {
	const [dragging, setDragging] = useState(false);
	const [categories, setCategories] = useState([]);

	useEffect(() => {
		// Simulating the behavior of useGetHeroDataQuery hook
		const fetchData = async () => {
			try {
				const response = await fetch("your-api-endpoint-here");
				const data = await response.json();
				setCategories(data.layout?.categories);
			} catch (error) {
				console.error("Error fetching data: ", error);
			}
		};

		fetchData();
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		setActive(active + 1);
	};

	const handleFileChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();

			reader.onload = (e) => {
				if (reader.readyState === 2) {
					setCourseInfo({ ...courseInfo, thumbnail: reader.result });
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setDragging(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		setDragging(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setDragging(false);

		const file = e.dataTransfer.files?.[0];

		if (file) {
			const reader = new FileReader();

			reader.onload = () => {
				setCourseInfo({ ...courseInfo, thumbnail: reader.result });
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="w-[80%] m-auto mt-24">
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="">Course Name</label>
					<input
						type="name"
						name=""
						required
						value={courseInfo.name}
						onChange={(e) =>
							setCourseInfo({
								...courseInfo,
								name: e.target.value
							})
						}
						id="name"
						placeholder="MERN stack LMS platform with next 13"
					/>
				</div>
				<br />
				<div className="mb-5">
					<label>Course Description</label>
					<textarea
						name=""
						id=""
						cols={30}
						rows={8}
						placeholder="Write something amazing..."
						value={courseInfo.description}
						onChange={(e) =>
							setCourseInfo({
								...courseInfo,
								description: e.target.value
							})
						}
					></textarea>
				</div>
				<br />
				<div className="w-full flex justify-between">
					<div className="w-[45%]">
						<label>Course Price</label>
						<input
							type="number"
							name=""
							required
							value={courseInfo.price}
							onChange={(e) =>
								setCourseInfo({
									...courseInfo,
									price: e.target.value
								})
							}
							id="price"
							placeholder="29"
						/>
					</div>
					<div className="w-[50%]">
						<label>Estimated Price (optional)</label>
						<input
							type="number"
							name=""
							value={courseInfo.estimatedPrice}
							onChange={(e) =>
								setCourseInfo({
									...courseInfo,
									estimatedPrice: e.target.value
								})
							}
							id="price"
							placeholder="79"
						/>
					</div>
				</div>
				<br />
				<div className="w-full flex justify-between">
					<div className="w-[45%]">
						<label htmlFor="email">Course Tags</label>
						<input
							type="text"
							required
							name=""
							value={courseInfo.tags}
							onChange={(e) =>
								setCourseInfo({
									...courseInfo,
									tags: e.target.value
								})
							}
							id="tags"
							placeholder="MERN,Next 13,Socket io,tailwind css,LMS"
						/>
					</div>
					<div className="w-[50%]">
						<label>Course Categories</label>
						<select
							name=""
							id=""
							value={courseInfo.category}
							onChange={(e) =>
								setCourseInfo({
									...courseInfo,
									categories: e.target.value
								})
							}
						>
							<option value="">Select Category</option>
							{categories &&
								categories.map((item) => (
									<option value={item.title} key={item._id}>
										{item.title}
									</option>
								))}
						</select>
					</div>
				</div>
				<br />
				<div className="w-full flex justify-between">
					<div className="w-[45%]">
						<label>Course Level</label>
						<input
							type="text"
							name=""
							value={courseInfo.level}
							required
							onChange={(e) =>
								setCourseInfo({
									...courseInfo,
									level: e.target.value
								})
							}
							id="level"
							placeholder="Beginner/Intermediate/Expert"
						/>
					</div>
					<div className="w-[50%]">
						<label>Demo Url</label>
						<input
							type="text"
							name=""
							required
							value={courseInfo.demoUrl}
							onChange={(e) =>
								setCourseInfo({
									...courseInfo,
									demoUrl: e.target.value
								})
							}
							id="demoUrl"
							placeholder="Enter Demo Url"
						/>
					</div>
				</div>
				<br />
				<div className="w-full">
					<input
						type="file"
						accept="image/*"
						id="file"
						className="hidden"
						onChange={handleFileChange}
					/>
					<label
						htmlFor="file"
						className={`w-full min-h-[10vh] border p-3 border-gray-300 ${
							dragging ? "bg-blue-500" : "bg-transparent"
						}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
						{courseInfo.thumbnail ? (
							<img
								src={courseInfo.thumbnail}
								alt=""
								className="max-h-full w-full object-cover"
							/>
						) : (
							<span>
								Drag and drop your thumbnail here or click to
								browse
							</span>
						)}
					</label>
				</div>
				<br />
				<div className="w-full flex items-center justify-end">
					<input
						type="submit"
						value="Next"
						className="w-full h-[40px] bg-[#37a39a] text-center text-white rounded mt-8 cursor-pointer"
					/>
				</div>
				<br />
				<br />
			</form>
		</div>
	);
}
