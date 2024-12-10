import express from "express";
import { getNews, getNewsById } from "../controllers/newsController.js";

const newsRoute = express.Router();

newsRoute.get("/", getNews);
newsRoute.get("/:newsId", getNewsById);

export default newsRoute;
