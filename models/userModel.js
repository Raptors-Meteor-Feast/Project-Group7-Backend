import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: String, required: true, minlength: 8 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    cartData: { type: Object, default: {} },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
}, { minimize: false, timestamps: true });


const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;