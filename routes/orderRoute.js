import express from "express";
import { createOrder, getOrders, payOrder } from "../controllers/orderController.js";

const router = express.Router();

// Route สำหรับสร้างคำสั่งซื้อ
router.post("/", createOrder);

// Route สำหรับดูคำสั่งซื้อทั้งหมด
router.get("/", getOrders);

// Route สำหรับชำระเงิน
router.post("/pay", payOrder);

export default router;
