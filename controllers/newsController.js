import newsModel from "../models/newsModel.js";

export const getNews = async (req, res) => {
  try {
    const news = await newsModel.find();
    res.status(200).json({
      data: news,
    });
  } catch (error) {
    res.status(500).send({
      error: error,
      status: "failure",
      message: "Internal server error.",
    });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const id = req.params.newsId;
    let detailNews = await newsModel.findById(id);
    if (!detailNews) {
      return res.status(400).send("Detail game not found");
    } else {
      res.json({ data: detailNews });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
