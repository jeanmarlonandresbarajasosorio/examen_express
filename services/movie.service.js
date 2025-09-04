import Movie from "../models/movie.model.js";

export const createMovie = async (data) => {
  const movie = new Movie(data);
  return await movie.save();
};

export const getMovies = async () => {
  return await Movie.find().populate("categories", "name");
};

export const getMovieById = async (id) => {
  return await Movie.findById(id).populate("categories", "name");
};

export const updateMovie = async (id, data) => {
  return await Movie.findByIdAndUpdate(id, data, { new: true });
};

export const deleteMovie = async (id) => {
  return await Movie.findByIdAndDelete(id);
};