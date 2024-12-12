import Order from "../models/orderModel.js";
import GameData from "../models/gameDataModel.js";
import User from "../models/userModel.js";
import cloudinary from "cloudinary";

// ฟังก์ชันอัปโหลดรูปภาพใบเสร็จ
const uploadReceipt = async (req, res) => {
    try {
        const { orderId } = req.params; // ดึง ID คำสั่งซื้อ
        const file = req.file; // รูปที่อัปโหลด

        if (!file) {
            return res.status(400).json({ message: "กรุณาอัปโหลดรูปภาพใบเสร็จ" });
        }

        // อัปโหลดรูปภาพไปยัง Cloudinary
        const result = await cloudinary.v2.uploader.upload(file.path, {
            folder: "paymentReceipts"
        });

        // อัปเดตรูปภาพในคำสั่งซื้อ
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { paymentReceipt: result.secure_url },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "ไม่พบคำสั่งซื้อ" });
        }

        res.status(200).json({
            message: "อัปโหลดรูปใบเสร็จสำเร็จ",
            order: updatedOrder
        });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการอัปโหลดใบเสร็จ:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
    }
};


// เพิ่มฟังก์ชันในการสร้างคำสั่งซื้อใหม่
const createOrder = async (req, res) => {
    try {
        const { userId, gameId, amount, paymentMethod } = req.body; // ดึงข้อมูลจาก body ของ request

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!userId || !gameId || !amount || !paymentMethod) {
            return res.status(400).json({
                message: "ข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบ"
            });
        }


        // ตรวจสอบว่าผู้ใช้และเกมที่ระบุมีอยู่จริง
        const user = await User.findById(userId); // ค้นหาผู้ใช้จาก ID
        const game = await GameData.findById(gameId); // ค้นหาเกมจาก ID

        if (!user) { // ถ้าไม่พบผู้ใช้
            return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ระบุ" });
        }

        if (!game) { // ถ้าไม่พบเกม
            return res.status(404).json({ message: "ไม่พบเกมที่ระบุ" });
        }

        // สร้างเอกสารคำสั่งซื้อใหม่
        const newOrder = new Order({
            userId, // ID ของผู้ใช้ที่สั่งซื้อ
            gameId, // ID ของเกมที่ซื้อ
            amount, // จำนวนเงินที่ชำระ
            paymentMethod, // วิธีการชำระเงิน
            status: "รอการชำระเงิน" // สถานะเริ่มต้นของคำสั่งซื้อ
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
            message: "สร้างคำสั่งซื้อสำเร็จ",
            order: savedOrder,
            orderId: savedOrder._id // ส่ง orderId กลับไปให้ frontend
        });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ:", error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์",
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
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }

        // ดึงคำสั่งซื้อทั้งหมดของผู้ใช้
        const orders = await Order.find({ userId }) // ค้นหาคำสั่งซื้อทั้งหมดที่เป็นของ userId
            .populate("gameId", "title price images") // เติมข้อมูลเกม
            .sort({ createdAt: -1 }); // เรียงลำดับคำสั่งซื้อจากใหม่ไปเก่า

        res.status(200).json(orders); // ส่งข้อมูลคำสั่งซื้อกลับไปยังผู้เรียก
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ:", error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ",
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
            "รอการชำระเงิน",
            "ชำระเงินสำเร็จ",
            "กำลังดำเนินการ",
            "สำเร็จ",
            "ยกเลิก"
        ];

        // ตรวจสอบว่าสถานะที่ส่งมาอยู่ในรายการที่อนุญาต
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "สถานะไม่ถูกต้อง"
            });
        }

        // อัพเดทสถานะคำสั่งซื้อในฐานข้อมูล
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId, // ID ของคำสั่งซื้อ
            { status }, // สถานะใหม่
            { new: true } // ส่งข้อมูลที่อัพเดทแล้วกลับมา
        ).populate([
            { path: "userId", select: "firstName lastName email" },
            { path: "gameId", select: "title price images" }
        ]);

        if (!updatedOrder) { // ถ้าไม่พบคำสั่งซื้อ
            return res.status(404).json({
                message: "ไม่พบคำสั่งซื้อ"
            });
        }

        res.status(200).json({
            message: "อัพเดทสถานะเรียบร้อย",
            order: updatedOrder
        });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการอัพเดทสถานะ:", error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการอัพเดทสถานะ",
            error: error.message
        });
    }
};

export { createOrder, getUserOrders, updateOrderStatus, uploadReceipt };
