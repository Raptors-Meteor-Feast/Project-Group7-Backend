import Order from "../models/orderModel.js";
import GameData from "../models/gameDataModel.js";
import User from "../models/userModel.js";
import cloudinary from "cloudinary";


const uploadReceipt = async (req, res) => {
    try {
        const { orderId } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "Upload at least one image" });
        }

        const uploadedImages = [];
        for (const file of files) {
            const result = await cloudinary.v2.uploader.upload(file.path, {
                folder: "paymentReceipts",
            });
            uploadedImages.push(result.secure_url);
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { $push: { paymentReceipts: { $each: uploadedImages } } },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Upload successful",
            order: updatedOrder,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Server error" });
    }
}


// เพิ่มฟังก์ชันในการสร้างคำสั่งซื้อใหม่
const createOrder = async (req, res) => {
    try {
        const { userId, gameId, amount, paymentMethod } = req.body; // ดึงข้อมูลจาก body ของ request

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!userId || !gameId || !amount || !paymentMethod) {
            return res.status(400).json({
                message: "Invalid request data",
            });
        }


        // ตรวจสอบว่าผู้ใช้และเกมที่ระบุมีอยู่จริง
        const user = await User.findById(userId);
        const game = await GameData.findById(gameId);
        if (!user) { // ถ้าไม่พบผู้ใช้
            return res.status(404).json({ message: "Invalid user" });
        }

        if (!game) { // ถ้าไม่พบเกม
            return res.status(404).json({ message: "Invalid game" });
        }

        // สร้างเอกสารคำสั่งซื้อใหม่
        const newOrder = new Order({
            userId,
            gameId,
            amount,
            paymentMethod,
            status: "Waiting for verify"
        });

        // บันทึกคำสั่งซื้อในฐานข้อมูล
        const savedOrder = await newOrder.save();

        // เติมข้อมูลผู้ใช้และเกม (populate)
        await savedOrder.populate([
            { path: "userId", select: "firstName lastName email" }, // ดึงเฉพาะฟิลด์ที่ต้องการจาก user
            { path: "gameId", select: "title price images" } // ดึงเฉพาะฟิลด์ที่ต้องการจาก game
        ]);

        // ส่งคำตอบกลับไปยังผู้เรียก
        res.status(201).json({
            message: "Order created successfully",
            order: savedOrder,
            orderId: savedOrder._id // ส่ง orderId กลับไปให้ frontend
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// ดึงรายการคำสั่งซื้อทั้งหมดของผู้ใช้
const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params; // ดึง userId จากพารามิเตอร์ใน URL

        // ตรวจสอบว่าผู้ใช้มีอยู่จริง
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ดึงคำสั่งซื้อทั้งหมดของผู้ใช้
        const orders = await Order.find({ userId }) // ค้นหาคำสั่งซื้อทั้งหมดที่เป็นของ userId
            .populate("gameId", "title price images") // เติมข้อมูลเกม
            .sort({ createdAt: -1 }); // เรียงลำดับคำสั่งซื้อจากใหม่ไปเก่า

        res.status(200).json(orders); // ส่งข้อมูลคำสั่งซื้อกลับไปยังผู้เรียก
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// อัพเดทสถานะคำสั่งซื้อ
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params; // ดึง orderId จากพารามิเตอร์ใน URL
        const { status } = req.body; // ดึงสถานะใหม่จาก body ของ request

        // รายการสถานะที่อนุญาต
        const allowedStatuses = [
            "Pending",
            "Waiting for verify",
            "On progress",
            "Completed",
            "Cancelled"
        ];

        // ตรวจสอบว่าสถานะที่ส่งมาอยู่ในรายการที่อนุญาต
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Status not allowed"
            });
        }

        // อัพเดทสถานะคำสั่งซื้อในฐานข้อมูล
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate([
            { path: "userId", select: "firstName lastName email" },
            { path: "gameId", select: "title price images" }
        ]);

        if (!updatedOrder) { // ถ้าไม่พบคำสั่งซื้อ
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order status updated successfully",
            order: updatedOrder
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

export { createOrder, getUserOrders, updateOrderStatus, uploadReceipt };
