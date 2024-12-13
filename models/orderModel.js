import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "gameData", required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true, default: "Waiting for verify" },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['promptpay', 'kbank', 'scb', 'krungsri', 'creditcard', 'paypal']
    },
    paymentReceipts: [{ type: String }], // Array สำหรับเก็บ URL ของใบเสร็จ
    payment: { type: Boolean, required: true, default: false },
    date: { type: Date, required: true, default: Date.now }
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
