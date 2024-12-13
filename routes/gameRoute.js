import express from "express";
import { listGame , getDetailGame, searchGame } from "../controllers/gameController.js";

const gameRouter = express.Router();

gameRouter.get("/", listGame);
gameRouter.get("/:id", getDetailGame);
gameRouter.post("/search", searchGame);

export default gameRouter;
