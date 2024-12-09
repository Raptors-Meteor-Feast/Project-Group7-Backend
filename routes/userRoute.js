import express from "express";
import { registerUser, loginUser, getdata } from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

// POST /api/auth/register
userRouter.post("/register", registerUser);

// POST /api/auth/login
userRouter.post("/login", loginUser);

// GET /api/auth/profile , TEST ONLY
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

// GET /api/auth/data
userRouter.get("/data", authUser, getdata);


export default userRouter;