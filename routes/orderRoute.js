import express from 'express';
import {
    createOrder,
    getUserOrders,
    updateOrderStatus
} from '../controllers/orderController.js';
import authUser from '../middleware/auth.js'; // เรียกใช้ middleware จาก auth.js

const router = express.Router();

// เส้นทางสร้างคำสั่งซื้อ (ต้องล็อกอิน)
router.post('/', authUser, createOrder);

// เส้นทางดึงคำสั่งซื้อทั้งหมดของผู้ใช้ (ต้องล็อกอิน)
router.get('/user/:userId', authUser, getUserOrders);

// เส้นทางอัพเดทสถานะคำสั่งซื้อ (สำหรับแอดมิน)
router.patch('/:orderId/status', authUser, updateOrderStatus);

export default router;