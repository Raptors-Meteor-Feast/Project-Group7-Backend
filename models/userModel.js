import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: String, required: true , minlength: 8 },
    resetPasswordToken: { type: String }, // Token สําหรับรีเซ็ตรหัสผ่าน
    resetPasswordExpires: { type: Date }, // วันหมดอายุของ Token สําหรับรีเซ็ตรหัสผ่าน
    cartData: { type: Object, default: {} }
}, { minimize: false, timestamps: true });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;