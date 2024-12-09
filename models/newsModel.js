import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    newsHeading: { type: String, required: true },
    newsImageUrl: { type: Array, required: true },
    newsContent: { type: String, required: true },
    newsParagraph: { type: String, required: true },
    date: { type: String, required: true },
    newsContributor: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

const newsModel = mongoose.models.news || mongoose.model("new", newsSchema);

export default newsModel;
