import mongoose from "mongoose";

const gameSystemSchema = new mongoose.Schema({
    gameId: { type: mongoose.Schema.Types.ObjectId, required: true },
    operator: { type: String, required: true },
    minimum: { type: { 
        osversion: { type: String, required: true },
        cpu: { type: String, required: true },
        gpu: { type: String, required: true },
        storage: { type: String, required: true }
    }, required: true },
    recommended: { type: {
        osversion: { type: String, required: true },
        cpu: { type: String, required: true },
        gpu: { type: String, required: true },
        storage: { type: String, required: true }
    }, required: true },
    language: { type: String, required: true },
    text: { type: String, required: true },
},{
    versionKey: false
}
)

const gameSystemModel = mongoose.models.gameSystem || mongoose.model("gameSystem", gameSystemSchema);

export default gameSystemModel;