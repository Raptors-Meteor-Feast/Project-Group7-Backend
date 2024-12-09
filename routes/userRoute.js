import express from "express";

import { registerUser, loginUser, getUserData } from "../controllers/userController.js";
import authUser from "../middleware/auth.js"; // Middleware สำหรับตรวจสอบการยืนยันตัวตน (Authentication)
import forgotPassword from "../controllers/Password/forgotPasswordController.js"; // ฟังก์ชันส่งลิงก์ Reset Password
import resetPassword from "../controllers/Password/resetPasswordController.js"; // ฟังก์ชันตั้งรหัสผ่านใหม่


const userRouter = express.Router();

// Route สำหรับการลงทะเบียนผู้ใช้
// POST /api/auth/register -> เรียกใช้ฟังก์ชัน registerUser
userRouter.post("/register", registerUser);

// Route สำหรับการเข้าสู่ระบบผู้ใช้
// POST /api/auth/login -> เรียกใช้ฟังก์ชัน loginUser
userRouter.post("/login", loginUser);

// Route สำหรับการเข้าถึงข้อมูลผู้ใช้ (เฉพาะการทดสอบ)
// GET /api/auth/profile -> ใช้ middleware authUser เพื่อตรวจสอบว่าเป็นผู้ใช้ที่ได้รับการยืนยันตัวตน
userRouter.get("/profile", authUser, (req, res) => {
    res.status(200).json({
        success: true,
        message: "You are authorized to access this route",
        data: {
            userId: req.body.userId,
            name: req.body.name, 
            email: req.body.email, 
        }
    });
});

// Route สำหรับการดึงข้อมูลบางส่วนของระบบ (Protected Route)
// GET /api/auth/data -> ใช้ middleware authUser และเรียกใช้ฟังก์ชัน getUserData
userRouter.get("/data", authUser, getUserData);

// Route สำหรับส่งลิงก์ Reset Password ไปยังอีเมลของผู้ใช้
// POST /api/auth/forgot-password -> เรียกใช้ฟังก์ชัน forgotPassword
userRouter.post("/forgot-password", forgotPassword);

// Route สำหรับตั้งรหัสผ่านใหม่โดยใช้ Token
// PUT /api/auth/reset-password/:token -> เรียกใช้ฟังก์ชัน resetPassword
userRouter.put("/reset-password/:token", resetPassword);


export default userRouter;
