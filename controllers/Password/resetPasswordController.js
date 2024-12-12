import bcrypt from "bcrypt";
import userModel from "../../models/userModel.js";

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    // ตรวจสอบว่า token และ password ถูกส่งมาหรือไม่
    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and password are required" });
    }

    try {
        // ค้นหา Token ที่ยังไม่หมดอายุ
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // แฮชรหัสผ่านใหม่
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // ล้าง Token และวันหมดอายุ
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Error resetting password" });
    }
};

export default resetPassword;
