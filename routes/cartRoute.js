import express from "express";
import { addToCart, deleteGameInCart, getUserCart } from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.get("/get", getUserCart);
cartRouter.post("/add", addToCart);
cartRouter.delete("/delete", deleteGameInCart);

export default cartRouter;