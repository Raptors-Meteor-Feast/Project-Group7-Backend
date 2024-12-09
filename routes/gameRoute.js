import express from "express";
import listGame from "../controllers/gameController.js";

const gameRouter = express.Router();

gameRouter.get("/browse", listGame);

export default gameRouter;
