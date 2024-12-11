import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
    // ดึง Authorization header ออกมา
    const authHeader = req.headers.authorization;
    console.log(authHeader)

    // ตรวจสอบว่า header มีค่าและมี "Bearer " อยู่ในข้อความหรือไม่
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: Token missing or malformed" });
    }

    // แยก token จาก Authorization header
    const token = authHeader.split(" ")[1]; // ตัดคำว่า "Bearer " ออก

    try {
        // ตรวจสอบ token ด้วย JWT secret ที่เก็บไว้ใน environment variable
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ success: false, message: "Server error: JWT secret missing" });
        }
        
        const token_decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(token_decoded); // พิมพ์ข้อมูลที่ decode มาเพื่อดูว่ามีอะไรบ้าง

        // เก็บ userId ลงใน req.body เพื่อส่งต่อไปยังฟังก์ชันถัดไป
        req.body.userId = token_decoded.id;

        // เรียก next() เพื่อไปยัง middleware ถัดไป
        next();
    } catch (error) {
        console.error(error);
        // แสดงข้อความข้อผิดพลาดที่เหมาะสมหากเกิดข้อผิดพลาดในการ verify token
        res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
    }
};

export default authUser;
