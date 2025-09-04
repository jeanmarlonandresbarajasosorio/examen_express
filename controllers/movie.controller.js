// backend/controllers/movie.controller.js
const MovieModel = require("../models/movie.model");
const { successResponse, errorResponse } = require("../utils/responseHandler");

class MovieController {
  // GET /api/movies
  async getMovies(req, res) {
    try {
      const { page = 1, limit = 12, category } = req.query;
      const movies = await MovieModel.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        category
      });
      successResponse(res, 200, "Películas obtenidas exitosamente", movies);
    } catch (error) {
      console.error("Error al obtener películas:", error);
      errorResponse(res, 500, "Error interno del servidor");
    }
  }

  // GET /api/movies/:id
  async getMovieById(req, res) {
    try {
      const movie = await MovieModel.getById(req.params.id);
      if (!movie) return errorResponse(res, 404, "Película no encontrada");
      successResponse(res, 200, "Película obtenida exitosamente", movie);
    } catch (error) {
      console.error("Error al obtener película:", error);
      errorResponse(res, 500, "Error interno del servidor");
    }
  }

  // POST /api/movies
  async createMovie(req, res) {
    try {
      const movie = await MovieModel.create(req.body);
      successResponse(res, 201, "Película creada exitosamente", movie);
    } catch (error) {
      console.error("Error al crear película:", error);
      errorResponse(res, 500, "Error interno del servidor");
    }
  }

  // PUT /api/movies/:id
  async updateMovie(req, res) {
    try {
      const updated = await MovieModel.update(req.params.id, req.body);
      if (!updated) return errorResponse(res, 404, "Película no encontrada");
      successResponse(res, 200, "Película actualizada exitosamente", updated);
    } catch (error) {
      console.error("Error al actualizar película:", error);
      errorResponse(res, 500, "Error interno del servidor");
    }
  }

  // DELETE /api/movies/:id
  async deleteMovie(req, res) {
    try {
      const deleted = await MovieModel.remove(req.params.id);
      if (!deleted) return errorResponse(res, 404, "Película no encontrada");
      successResponse(res, 200, "Película eliminada exitosamente", deleted);
    } catch (error) {
      console.error("Error al eliminar película:", error);
      errorResponse(res, 500, "Error interno del servidor");
    }
  }

  // PATCH /api/movies/:id/approve
  async approveMovie(req, res) {
    try {
      const approved = await MovieModel.approve(req.params.id);
      if (!approved) return errorResponse(res, 404, "Película no encontrada");
      successResponse(res, 200, "Película aprobada exitosamente", approved);
    } catch (error) {
      console.error("Error al aprobar película:", error);
      errorResponse(res, 500, "Error interno del servidor");
    }
  }

  // GET /api/movies/popular
  async getPopularMovies(req, res) {
    try {
      const { limit = 6 } = req.query;
      const movies = await MovieModel.getPopular(parseInt(limit));
      successResponse(res, 200, "Películas populares obtenidas exitosamente", movies);
    } catch (error) {
      console.error("Error al obtener películas populares:", error);
      errorResponse(res, 500, "Error interno del servidor");
    }
  }

  // GET /api/movies/recent
  async getRecentMovies(req, res) {
    try {
      const { limit = 6 } = req.query;
      const movies = await MovieModel.getRecent(parseInt(limit));
      successResponse(res, 200, "Películas recientes obtenidas exitosamente", movies);
    } catch (error) {
      console.error("Error al obtener películas recientes:", error);
      errorResponse(res, 500, "Error interno del servidor");
    }
  }
}

module.exports = MovieController;