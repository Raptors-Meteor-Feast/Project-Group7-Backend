import express from "express";
import { addToCart, deleteGameInCart, getUserCart, clearCart } from "../controllers/cartController.js";
import authUser from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.get("/", authUser, getUserCart);
cartRouter.post("/add", authUser, addToCart);
cartRouter.delete("/delete", authUser, deleteGameInCart);
cartRouter.patch("/clear", authUser, clearCart);


export default cartRouter;