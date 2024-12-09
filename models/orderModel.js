import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true, default: "Waiting for verify" },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    date: { type: Date, required: true, default: Date.now }
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;