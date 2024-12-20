import { v2 as cloudinary } from "cloudinary";
import gameDataModel from "../models/gameDataModel.js";
import gameSystemModel from "../models/gameSystemModel.js";

//Get เกมทั้งหมด
const listGame = async (req, res) => {
  try {
    const game = await gameDataModel.find({});
    res.json({ success: true, game });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Get เกมบางเกม
const getDetailGame = async (req, res) => {
    const id = req.params.id;

    try {
        if(!id) {
            res.status(400).json({ message: "Id not match." });
            return;
        }

        const game = await gameDataModel.findById(id);
        const system = await gameSystemModel.findOne({ gameId: id });
        if(!game && !system){
            res.status(400).json({ message: "Game not found." });
            return;
        }

        res.json({ game, system });
    } catch (error) {
        console.log(error);
        res.status(500).json( {message: error.message });
    }
}

const searchGame = async (req, res) => {
  const { title } = req.body; 
  try {
    // ใช้ Regular Expression และ options "i" สำหรับ case-insensitive
    const games = await gameDataModel.find({ title: { $regex: title, $options: "i" } });
    res.status(200).json({ games });
  } catch (error) {
    res.status(500).json({ message: "Error fetching games", error });
  }
};

export { listGame, getDetailGame, searchGame };
