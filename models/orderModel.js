import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // เพิ่ม ref ไปยังโมเดลผู้ใช้
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "gameData", required: true }, // เพิ่ม ref ไปยังโมเดลเกม
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true, default: "Waiting for verify" },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['promptpay','kbank', 'scb', 'krungsri', 'creditcard', 'paypal'] // กำหนดค่า enum ที่อนุญาต
    },
    payment: { type: Boolean, required: true, default: false },
    date: { type: Date, required: true, default: Date.now }
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
