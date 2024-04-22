import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CoursePlayer({ videoUrl }) {
	const [videoData, setVideoData] = useState({
		otp: "",
		playbackInfo: ""
	});

	useEffect(() => {
		axios
			.post(`${process.env.NEXT_PUBLIC_SERVER_URI}getVdoCipherOTP`, {
				videoId: videoUrl
			})
			.then((res) => {
				setVideoData(res.data);
			});
	}, [videoUrl]);

	return (
		<div
			style={{
				position: "relative",
				paddingTop: "56.25%",
				overflow: "hidden"
			}}
		>
			{videoData.otp && videoData.playbackInfo !== "" && (
				<iframe
					src={`https://player.vdocipher.com/v2/?otp=${videoData?.otp}&playbackInfo=${videoData.playbackInfo}&player=3thUX4gz2Z2U5DvN`}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						border: 0
					}}
					allowFullScreen={true}
					allow="encrypted-media"
				></iframe>
			)}
		</div>
	);
}
