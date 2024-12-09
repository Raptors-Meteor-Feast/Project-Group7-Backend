import express from "express";
import { listGame , getDetailGame } from "../controllers/gameController.js";

const gameRouter = express.Router();

gameRouter.get("/", listGame);
gameRouter.get("/:id", getDetailGame);


export default gameRouter;