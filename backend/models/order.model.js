import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
	{
		courseId: {
			type: String,
			required: true
		},
		userId: {
			type: String,
			required: true
		},
		payment_info: {
			type: Object
			// required: true
		}
	},
	{ timestamps: true }
);

const OrderModel = mongoose.model("Order", orderSchema);

export { OrderModel };
