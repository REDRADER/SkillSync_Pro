import { v2 as cloudinary } from "cloudinary";
import http from "http";
import connectDB from "../backend/configs/dbConnect.js";
import { initSocketServer } from "../backend/utils/socketServer.js";
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const server = http.createServer(app);

// cloudinary config
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

initSocketServer(server);

// create server
server.listen(process.env.PORT, () => {
	console.log(`Server is connected with port ${process.env.PORT}`);
	connectDB();
});
