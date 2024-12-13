import express from "express";
import { registerUser, loginUser, getUserData, verifyEmail } from "../controllers/userController.js";
import authUser from "../middleware/auth.js";
import forgotPassword from "../controllers/Password/forgotPasswordController.js";
import resetPassword from "../controllers/Password/resetPasswordController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.get("/verify-email/:token", verifyEmail);
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
userRouter.get("/data", authUser, getUserData);

// Route สำหรับส่งลิงก์ Reset Password ไปยังอีเมลของผู้ใช้
userRouter.post("/forgot-password", forgotPassword);

// Route สำหรับตั้งรหัสผ่านใหม่โดยใช้ Token
userRouter.put("/reset-password/:token", resetPassword);


export default userRouter;