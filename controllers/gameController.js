import { v2 as cloudinary } from "cloudinary";
import gameDataModel from "../models/gameDataModel.js";

const listGame = async (req, res) => {
  try {
    const game = await gameDataModel.find({});
    res.json({ success: true, game });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default listGame;
