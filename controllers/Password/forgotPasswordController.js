import dotenv from 'dotenv';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import crypto from 'crypto';
import userModel from '../../models/userModel.js';

dotenv.config();  // โหลดข้อมูลจาก .env

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expires = Date.now() + 3600000; // 1 ชั่วโมง
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();

        // ตั้งค่า Sendinblue
        const apiKey = process.env.SENDINBLUE_API_KEY;
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKeyInstance = defaultClient.authentications['api-key'];
        apiKeyInstance.apiKey = apiKey;
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        const resetURL = `${process.env.VITE_APP_BASE_URL}/reset-password/${token}`;



        // สร้างเนื้อหาของอีเมลล์
        const emailData = {
            sender: { email: process.env.EMAIL_ADDRESS },  // อีเมลล์ที่ได้รับการยืนยันจาก Sendinblue
            to: [{ email: user.email }],
            subject: 'Password Reset',
            htmlContent: `
                <html>
                    <body>
                        <p>Please click the link below to reset your password:</p>
                        <a href="${resetURL}">${resetURL}</a>
                    </body>
                </html>`,
            textContent: `Please click the link below to reset your password:`, // เพิ่มข้อความ plain text เผื่อ HTML ไม่แสดง
        };

        // ส่งอีเมล
        const response = await apiInstance.sendTransacEmail(emailData);
        console.log('Email sent successfully:', response);  // แสดงผลการตอบกลับจาก Sendinblue

        res.status(200).json({ message: "Reset link sent to your email" });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({
            message: "Error sending reset email",
            error: error.response ? error.response.body : error.message
        });
    }
};

export default forgotPassword;

