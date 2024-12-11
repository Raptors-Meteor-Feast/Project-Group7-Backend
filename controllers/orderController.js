import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"; // Import userModel

// Controller สำหรับสร้างคำสั่งซื้อใหม่
const createOrder = async (req, res) => {
    try {
        const { userId, items, amount, paymentMethod } = req.body;

        // ตรวจสอบข้อมูลที่ส่งมาว่าครบถ้วนหรือไม่
        if (!userId || !items || !amount || !paymentMethod) {
            return res.status(400).json({ message: "Not enough data" });
        }

        // ตรวจสอบว่า userId มีอยู่ในฐานข้อมูลหรือไม่
        const userExists = await userModel.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        // สร้างคำสั่งซื้อในฐานข้อมูล
        const newOrder = new orderModel({
            userId,
            items,
            amount,
            paymentMethod,
            status: "Waiting for verify",
            payment: false,
        });

        await newOrder.save(); // บันทึกลงฐานข้อมูล
        res.status(201).json(newOrder); // ส่งกลับข้อมูลคำสั่งซื้อที่สร้าง
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Error creating order" });
    }
};

// Controller สำหรับจ่ายเงิน
const payOrder = async (req, res) => {
    try {
        const { orderId, userId } = req.body;

        // ตรวจสอบว่าข้อมูลครบถ้วน
        if (!orderId || !userId) {
            return res.status(400).json({ message: "Ensure all data is provided" });
        }

        // ตรวจสอบว่า order มีอยู่และ userId ตรงกันหรือไม่
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.userId.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        // อัปเดตสถานะการชำระเงิน
        order.payment = true;
        order.status = "Paid";
        await order.save();

        res.status(200).json({ message: "Payment successful", order });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Payment failed" });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await orderModel.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export { createOrder, payOrder, getOrders };