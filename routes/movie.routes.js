// backend/routes/movie.routes.js
const express = require('express');
const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');
const router = express.Router();

// Validaciones
const movieValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El título debe tener entre 1 y 100 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('La categoría debe ser un ID válido'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
    .withMessage('El año debe ser válido'),
  body('image')
    .optional()
    .isURL()
    .withMessage('La imagen debe ser una URL válida')
];

const idValidation = [
  param('id').isMongoId().withMessage('ID inválido')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('El límite debe ser entre 1 y 50'),
  query('category').optional().isMongoId().withMessage('La categoría debe ser un ID válido')
];

// Función de respuesta exitosa
const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

// Función de respuesta de error
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

// Inicializar rutas con base de datos
const initializeRoutes = (db) => {
  const { ObjectId } = require('mongodb');
  const moviesCollection = db.collection('movies');

  /**
   * GET /api/movies
   * Obtener todas las películas aprobadas con filtros y paginación
   */
  router.get('/', queryValidation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'Parámetros inválidos', errors.array());
      }

      const {
        page = 1,
        limit = 12,
        category,
        sortBy = 'rating',
        search
      } = req.query;

      const skip = (page - 1) * limit;
      const filter = { approved: true };

      // Filtro por categoría
      if (category) {
        filter.category = category;
      }

      // Filtro por búsqueda en título
      if (search) {
        filter.title = { $regex: search, $options: 'i' };
      }

      // Opciones de ordenamiento
      let sort = {};
      if (sortBy === 'rating') {
        sort = { rating: -1, reviewCount: -1 };
      } else if (sortBy === 'year') {
        sort = { year: -1 };
      } else if (sortBy === 'title') {
        sort = { title: 1 };
      } else if (sortBy === 'newest') {
        sort = { createdAt: -1 };
      }

      const [movies, total] = await Promise.all([
        moviesCollection
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .toArray(),
        moviesCollection.countDocuments(filter)
      ]);

      const result = {
        movies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
          hasNext: page < Math.ceil(total / parseInt(limit)),
          hasPrev: page > 1
        }
      };

      successResponse(res, 200, 'Películas obtenidas exitosamente', result);
    } catch (error) {
      console.error('Error al obtener películas:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * GET /api/movies/popular
   * Obtener películas populares
   */
  router.get('/popular', async (req, res) => {
    try {
      const { limit = 6 } = req.query;
      
      const movies = await moviesCollection
        .find({ approved: true, reviewCount: { $gt: 0 } })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      successResponse(res, 200, 'Películas populares obtenidas exitosamente', movies);
    } catch (error) {
      console.error('Error al obtener películas populares:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * GET /api/movies/recent
   * Obtener películas recientes
   */
  router.get('/recent', async (req, res) => {
    try {
      const { limit = 6 } = req.query;
      
      const movies = await moviesCollection
        .find({ approved: true })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      successResponse(res, 200, 'Películas recientes obtenidas exitosamente', movies);
    } catch (error) {
      console.error('Error al obtener películas recientes:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * GET /api/movies/:id
   * Obtener película por ID
   */
  router.get('/:id', idValidation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'ID inválido', errors.array());
      }

      const { id } = req.params;
      
      if (!ObjectId.isValid(id)) {
        return errorResponse(res, 400, 'ID de película inválido');
      }

      const movie = await moviesCollection.findOne({ _id: new ObjectId(id) });

      if (!movie) {
        return errorResponse(res, 404, 'Película no encontrada');
      }

      successResponse(res, 200, 'Película obtenida exitosamente', movie);
    } catch (error) {
      console.error('Error al obtener película:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * POST /api/movies
   * Crear nueva película
   */
  router.post('/', movieValidation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'Datos inválidos', errors.array());
      }

      const { title, description, category, year, image } = req.body;

      // Verificar si la película ya existe
      const existingMovie = await moviesCollection.findOne({ 
        title: { $regex: `^${title}$`, $options: 'i' } 
      });
      
      if (existingMovie) {
        return errorResponse(res, 409, 'Ya existe una película con ese título');
      }

      const movieData = {
        title,
        description,
        category: category || null,
        year: parseInt(year),
        image: image || null,
        rating: 0,
        reviewCount: 0,
        likeCount: 0,
        approved: false, // Requiere aprobación de admin
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await moviesCollection.insertOne(movieData);
      const movie = { ...movieData, _id: result.insertedId };

      successResponse(res, 201, 'Película creada exitosamente. Pendiente de aprobación.', movie);
    } catch (error) {
      console.error('Error al crear película:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * PUT /api/movies/:id
   * Actualizar película
   */
  router.put('/:id', idValidation, movieValidation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'Datos inválidos', errors.array());
      }

      const { id } = req.params;
      const { title, description, category, year, image } = req.body;

      if (!ObjectId.isValid(id)) {
        return errorResponse(res, 400, 'ID de película inválido');
      }

      const movie = await moviesCollection.findOne({ _id: new ObjectId(id) });
      if (!movie) {
        return errorResponse(res, 404, 'Película no encontrada');
      }

      // Si cambió el título, verificar que no existe otro con el mismo
      if (title && title !== movie.title) {
        const existingMovie = await moviesCollection.findOne({ 
          title: { $regex: `^${title}$`, $options: 'i' },
          _id: { $ne: new ObjectId(id) }
        });
        if (existingMovie) {
          return errorResponse(res, 409, 'Ya existe una película con ese título');
        }
      }

      const updateData = {
        updatedAt: new Date()
      };
      
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (category) updateData.category = category;
      if (year) updateData.year = parseInt(year);
      if (image !== undefined) updateData.image = image;

      const result = await moviesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.modifiedCount === 0) {
        return errorResponse(res, 404, 'Película no encontrada');
      }

      successResponse(res, 200, 'Película actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar película:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * DELETE /api/movies/:id
   * Eliminar película (solo admin)
   */
  router.delete('/:id', idValidation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'ID inválido', errors.array());
      }

      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return errorResponse(res, 400, 'ID de película inválido');
      }

      const result = await moviesCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return errorResponse(res, 404, 'Película no encontrada');
      }

      successResponse(res, 200, 'Película eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar película:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * PATCH /api/movies/:id/approve
   * Aprobar película (solo admin)
   */
  router.patch('/:id/approve', idValidation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'ID inválido', errors.array());
      }

      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return errorResponse(res, 400, 'ID de película inválido');
      }

      const result = await moviesCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            approved: true,
            updatedAt: new Date()
          } 
        }
      );

      if (result.modifiedCount === 0) {
        return errorResponse(res, 404, 'Película no encontrada');
      }

      successResponse(res, 200, 'Película aprobada exitosamente');
    } catch (error) {
      console.error('Error al aprobar película:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  return router;
};

module.exports = initializeRoutes;