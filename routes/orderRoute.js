import express from 'express';
import {
    createOrder,
    getUserOrders,
    updateOrderStatus,
    uploadReceipt
} from '../controllers/orderController.js';
import authUser from '../middleware/auth.js'; // เรียกใช้ middleware จาก auth.js
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // จัดการการอัปโหลดไฟล์

// เส้นทางอัปโหลดใบเสร็จการชำระเงิน
router.post("/:orderId/receipt", authUser, upload.array("files"), uploadReceipt);

// เส้นทางสร้างคำสั่งซื้อ (ต้องล็อกอิน)
router.post('/', authUser, createOrder);

// เส้นทางดึงคำสั่งซื้อทั้งหมดของผู้ใช้ (ต้องล็อกอิน)
router.get('/user/:userId', authUser, getUserOrders);

// เส้นทางอัพเดทสถานะคำสั่งซื้อ (สำหรับแอดมิน)
router.patch('/:orderId/status', authUser, updateOrderStatus);

export default router;