import newsModel from "../models/newsModel.js";

export const getNews = async (req, res) => {
  try {
    const news = await newsModel.find();
    res.status(200).send({
      news: news,
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
    const detailNews = await newsModel.findById(id);
    res.status(200).json({
      data: detailNews,
    });
  } catch (error) {
    res.status(500).send({
      status: "failure",
      message: "Internal server error.",
    });
  }
};
