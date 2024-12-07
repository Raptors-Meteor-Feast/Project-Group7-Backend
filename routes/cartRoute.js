import express from "express";
import { addToCart, deleteGameInCart, getUserCart } from "../controllers/cartController.js";
import authUser from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.get("/get", authUser, getUserCart);
cartRouter.post("/add", authUser, addToCart);
cartRouter.delete("/delete", authUser, deleteGameInCart);

export default cartRouter;