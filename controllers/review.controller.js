const Review = require("../models/Review");
const Movie = require("../models/Movie");

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user").populate("movie");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reseñas", error });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate("user").populate("movie");
    if (!review) return res.status(404).json({ message: "Reseña no encontrada" });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reseña", error });
  }
};

exports.createReview = async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();

    // Agregar reseña a la película
    await Movie.findByIdAndUpdate(review.movie, {
      $push: { reviews: review._id },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: "Error al crear reseña", error });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedReview)
      return res.status(404).json({ message: "Reseña no encontrada" });

    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar reseña", error });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview)
      return res.status(404).json({ message: "Reseña no encontrada" });

    res.json({ message: "Reseña eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar reseña", error });
  }
};