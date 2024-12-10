import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import SibApiV3Sdk from "sib-api-v3-sdk";
import crypto from "crypto";


dotenv.config();

const sendVerificationEmail = async (user) => {
    const token = crypto.randomBytes(32).toString("hex");  // สร้างโทเค็นยืนยัน
    const verificationURL = `http://localhost:5173/verify-email/${token}`;  // ลิงก์สำหรับยืนยันอีเมล

    user.emailVerificationToken = token;  // เก็บโทเค็นในฐานข้อมูล
    await user.save();

    const apiKey = process.env.SENDINBLUE_API_KEY;
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKeyInstance = defaultClient.authentications["api-key"];
    apiKeyInstance.apiKey = apiKey;
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const emailData = {
        sender: { email: process.env.EMAIL_ADDRESS },
        to: [{ email: user.email }],
        subject: "Email Verification",
        htmlContent: `
            <html>
                <body>
                    <p>Click the link below to verify your email address:</p>
                    <a href="${verificationURL}">${verificationURL}</a>
                </body>
            </html>
        `,
        textContent: `Click the link below to verify your email address: ${verificationURL}`,
    };

    try {
        await apiInstance.sendTransacEmail(emailData);
        console.log("Verification email sent.");
    } catch (error) {
        console.error("Error sending verification email:", error);
    }
};

// ฟังก์ชันสำหรับลงทะเบียนผู้ใช้ใหม่
const registerUser = async (req, res) => {
    const { firstName, lastName, displayName, email, password } = req.body;

    try {
        // ตรวจสอบว่ามีผู้ใช้อีเมลนี้ในระบบแล้วหรือยัง
        const existingUser = await userModel.findOne({ email });
        if (existingUser) { // ถ้ามีผู้ใช้ที่ใช้ email นี้แล้ว ให้ตอบกลับด้วยสถานะ 400
            return res.status(400).json({ message: "User already exists" });
        }

        // ตรวจสอบรูปแบบของอีเมล
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // ตรวจสอบความยาวของรหัสผ่าน
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // สร้าง salt และแฮชรหัสผ่าน
        const salt = await bcrypt.genSalt(10); // สร้าง salt 10 รอบ
        const hashedPassword = await bcrypt.hash(password, salt); // แฮชรหัสผ่าน

        // สร้างผู้ใช้ใหม่ในฐานข้อมูล
        const newUser = await userModel.create({
            firstName,
            lastName,
            displayName,
            email,
            password: hashedPassword, // ใช้รหัสผ่านที่แฮชแล้ว
        });

        await sendVerificationEmail(newUser);

        // ตอบกลับผู้ใช้ที่ลงทะเบียนสำเร็จ
        res.status(201).json({ message: "User registered successfully. Please verify your email.", userId: newUser._id });
    } catch (error) {
        // ถ้ามีข้อผิดพลาดในระหว่างการลงทะเบียน
        console.error(error);
        res.status(500).json({ message: "Error registering user" });
    }
};

// ฟังก์ชันสำหรับการยืนยันอีเมล
const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await userModel.findOne({
            emailVerificationToken: token,
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;  // ลบโทเค็นออก
        await user.save();

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Error in verifyEmail:", error);
        res.status(500).json({ message: "Error verifying email" });
    }
};


// ฟังก์ชันสำหรับสร้าง JWT token
const createToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // สร้าง token โดยกำหนดเวลาให้หมดอายุภายใน 1 ชั่วโมง
};

// ฟังก์ชันสำหรับการเข้าสู่ระบบ (login)
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; // ดึงข้อมูลจาก body ของคำขอ
        const user = await userModel.findOne({ email }); // ค้นหาผู้ใช้จากอีเมล
        if (!user) { // ถ้าไม่พบผู้ใช้
            return res.status(400).json({ message: "User not found" });
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) { // ถ้ารหัสผ่านตรงกัน
            // สร้าง JWT token และส่งกลับไปให้ผู้ใช้
            const token = createToken(user._id);
            res.status(200).json({ success: true, token });
        } else {
            res.status(400).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        // ถ้ามีข้อผิดพลาดในการเข้าสู่ระบบ
        console.error(error);
        res.status(500).json({ message: "Error logging in user" });
    }
};

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ (ต้องตรวจสอบ token ด้วย)
const getUserData = async (req, res) => {
    try {
        // ตรวจสอบว่า Authorization header มีค่าเป็น "Bearer <token>" หรือไม่
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" }); // ถ้าไม่มีหรือไม่ถูกต้อง
        }

        // แยก token ออกมาจาก header
        const token = authHeader.split(" ")[1];

        // ตรวจสอบและถอดรหัส token โดยใช้ jwt.verify
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ใช้ userId ที่ได้จาก decoded token เพื่อค้นหาผู้ใช้ในฐานข้อมูล
        const user = await userModel.findById(decoded.id); // แก้ไขตรงนี้ให้ใช้ decoded.id
        if (!user) {
            return res.status(404).json({ error: "User not found" }); // ถ้าไม่พบผู้ใช้
        }

        // ส่งข้อมูลผู้ใช้กลับไป
        res.json({
            displayName: user.displayName,
            email: user.email,
            avatar: user.avatar || "https://example.com/avatar.jpg"  // อาจจะดึงจากฐานข้อมูลหรือจาก Cloud Storage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" }); // ถ้ามีข้อผิดพลาดในการประมวลผล
    }
};


export { registerUser, loginUser, getUserData, verifyEmail };
