import mongoose from "mongoose";

const gameDataSchema = new mongoose.Schema({
    title: { type: String, required: true },
    categories: { type: Array, required: true },
    price: { type: Number, required: true },
    images: { type: Array, required: true },
    mainContent: { type: String, required: true },
    subContent: { type: String, required: true },
    rating: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    bestSeller: { type: Boolean, required: true }
},{
    versionKey: false
})

const gameDataModel = mongoose.models.gameData || mongoose.model("gameData", gameDataSchema);

export default gameDataModel;