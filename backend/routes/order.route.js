import express from "express";
import {
	authorizeRoles,
	isAutheticated
} from "../middlewares/auth.middleware.js";
import {
	createOrder,
	getAllOrders,
	newPayment,
	sendStripePublishableKey
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/create-order", isAutheticated, createOrder);

orderRouter.get(
	"/get-orders",
	isAutheticated,
	authorizeRoles("admin"),
	getAllOrders
);

orderRouter.get("/payment/stripepublishablekey", sendStripePublishableKey);

orderRouter.post("/payment", isAutheticated, newPayment);

export { orderRouter };
