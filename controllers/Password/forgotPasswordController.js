import crypto from "crypto";
import nodemailer from "nodemailer";

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // สร้าง Token และกำหนดวันหมดอายุ
        const token = crypto.randomBytes(32).toString("hex");
        const expires = Date.now() + 3600000; // 1 ชั่วโมง

        // บันทึก Token และวันหมดอายุใน DB
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();

        // ส่งอีเมลพร้อมลิงก์
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetURL = `${req.protocol}://${req.get("host")}/reset-password/${token}`;
        const mailOptions = {
            to: user.email,
            subject: "Password Reset",
            html: `<p>Please click the link to reset your password:</p>
                   <a href="${resetURL}">${resetURL}</a>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Reset link sent to your email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error sending reset email" });
    }
};
