import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
    const { firstName, lastName, displayName, email, password } = req.body;
    try {
        //Check if arady has an email
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //Create new user
        const newUser = await userModel.create({
            firstName,
            lastName,
            displayName,
            email,
            password: hashedPassword,
        });
        res.status(201).json({ message: "User registered successfully", userId: newUser._id });
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
    }
};


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        //Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            //Create token
            const token = createToken(user._id);
            res.status(200).json({ success: true, token });
        } else {
            res.status(400).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error logging in user" });
    }
};

const getdata = async (req, res) => {
    try {
        // ตรวจสอบว่า Authorization header มีค่าเป็น "Bearer <token>" หรือไม่
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // แยก token ออกมาจาก header
        const token = authHeader.split(" ")[1];

        // ตรวจสอบและถอดรหัส token โดยใช้ jwt.verify
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ใช้ userId ที่ได้จาก decoded token เพื่อค้นหาผู้ใช้ในฐานข้อมูล
        const user = await userModel.findById(decoded.id); // แก้ไขตรงนี้ให้ใช้ decoded.id
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // ส่งข้อมูลผู้ใช้กลับไป
        res.json({
            displayName: user.displayName,
            email: user.email,
            avatar: "https://example.com/avatar.jpg"  // อาจจะดึงจากฐานข้อมูลหรือจาก Cloud Storage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



export { registerUser, loginUser, getdata };




