import Review from "../models/review.model.js";
import Movie from "../models/movie.model.js";

export const createReview = async ({ user, movieId, rating, comment }) => {
  const movie = await Movie.findById(movieId);
  if (!movie) throw new Error("Película no encontrada");

  const review = new Review({
    user,
    movie: movieId,
    rating,
    comment,
  });

  await review.save();
  return review;
};

export const getReviewsByMovie = async (movieId) => {
  return await Review.find({ movie: movieId })
    .populate("user", "name email")
    .populate("movie", "title");
};

export const deleteReview = async (id, userId) => {
  const review = await Review.findById(id);
  if (!review) throw new Error("Reseña no encontrada");
  if (review.user.toString() !== userId.toString()) {
    throw new Error("No autorizado para eliminar esta reseña");
  }
  await review.deleteOne();
  return true;
};