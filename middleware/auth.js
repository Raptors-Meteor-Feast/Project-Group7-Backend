import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
    const authHeader = req.headers.authorization; // ใช้ authHeader แทนการใช้ req.headers.token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1]; // ดึง token ออกมา
    try {
        const token_decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(token_decoded);
        req.body.userId = token_decoded.id;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, message: error.message });
    }
};

export default authUser;