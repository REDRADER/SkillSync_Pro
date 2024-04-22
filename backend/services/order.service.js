import CatchAsyncError from "../middlewares/catchAsyncError.middleware.js";
import { OrderModel } from "../models/order.model.js";

// create new order
export const newOrder = CatchAsyncError(async (data, res) => {
	const order = await OrderModel.create(data);

	res.status(201).json({
		success: true,
		order
	});
});

// Get All Orders
export const getAllOrdersService = async (res) => {
	const orders = await OrderModel.find().sort({ createdAt: -1 });

	res.status(201).json({
		success: true,
		orders
	});
};
