// backend/routes/category.routes.js
const express = require('express');
const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');
const CategoryModel = require('../models/category.model');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

// Inicializar con la base de datos (compatible con tu estructura)
const initializeRoutes = (db) => {
  const categoryModel = new CategoryModel(db);

  // Validaciones
  const categoryValidation = [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('La descripción no puede exceder 200 caracteres')
  ];

  const idValidation = [
    param('id').isMongoId().withMessage('ID inválido')
  ];

  /**
   * @swagger
   * /api/categories:
   *   get:
   *     summary: Obtener todas las categorías
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: Lista de categorías
   */
  router.get('/', async (req, res) => {
    try {
      const categories = await categoryModel.findAll();
      successResponse(res, 200, 'Categorías obtenidas exitosamente', categories);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * @swagger
   * /api/categories/{id}:
   *   get:
   *     summary: Obtener categoría por ID
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la categoría
   *     responses:
   *       200:
   *         description: Categoría encontrada
   *       404:
   *         description: Categoría no encontrada
   */
  router.get('/:id', idValidation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'Datos inválidos', errors.array());
      }

      const { id } = req.params;
      const category = await categoryModel.findById(id);

      if (!category) {
        return errorResponse(res, 404, 'Categoría no encontrada');
      }

      successResponse(res, 200, 'Categoría obtenida exitosamente', category);
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      if (error.message === 'ID inválido') {
        return errorResponse(res, 400, 'ID de categoría inválido');
      }
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * @swagger
   * /api/categories:
   *   post:
   *     summary: Crear nueva categoría (solo admin)
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Categoría creada exitosamente
   *       400:
   *         description: Datos inválidos
   *       409:
   *         description: La categoría ya existe
   */
  router.post('/', categoryValidation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'Datos inválidos', errors.array());
      }

      const { name, description } = req.body;

      // Verificar si la categoría ya existe
      const existingCategory = await categoryModel.findByName(name);
      if (existingCategory) {
        return errorResponse(res, 409, 'Ya existe una categoría con ese nombre');
      }

      const categoryData = {
        name,
        description: description || null
      };

      const category = await categoryModel.create(categoryData);
      successResponse(res, 201, 'Categoría creada exitosamente', category);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * @swagger
   * /api/categories/{id}:
   *   put:
   *     summary: Actualizar categoría (solo admin)
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Categoría actualizada
   *       404:
   *         description: Categoría no encontrada
   *       409:
   *         description: Nombre ya existe
   */
  router.put('/:id', idValidation, categoryValidation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'Datos inválidos', errors.array());
      }

      const { id } = req.params;
      const { name, description } = req.body;

      // Verificar si la categoría existe
      const category = await categoryModel.findById(id);
      if (!category) {
        return errorResponse(res, 404, 'Categoría no encontrada');
      }

      // Si cambió el nombre, verificar que no existe otro con el mismo
      if (name && name !== category.name) {
        const existingCategory = await categoryModel.findByName(name);
        if (existingCategory && existingCategory._id.toString() !== id) {
          return errorResponse(res, 409, 'Ya existe una categoría con ese nombre');
        }
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      const updated = await categoryModel.update(id, updateData);

      if (!updated) {
        return errorResponse(res, 404, 'Categoría no encontrada');
      }

      successResponse(res, 200, 'Categoría actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * @swagger
   * /api/categories/{id}:
   *   delete:
   *     summary: Eliminar categoría (solo admin)
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Categoría eliminada
   *       404:
   *         description: Categoría no encontrada
   */
  router.delete('/:id', idValidation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'ID inválido', errors.array());
      }

      const { id } = req.params;
      const deleted = await categoryModel.delete(id);

      if (!deleted) {
        return errorResponse(res, 404, 'Categoría no encontrada');
      }

      successResponse(res, 200, 'Categoría eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  return router;
};

module.exports = initializeRoutes;

  // Validaciones
  const categoryValidation = [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('La descripción no puede exceder 200 caracteres')
  ];

  const idValidation = [
    param('id').isMongoId().withMessage('ID inválido')
  ];

  /**
   * @swagger
   * /api/categories:
   *   get:
   *     summary: Obtener todas las categorías
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: Lista de categorías
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Category'
   */
  router.get('/', async (req, res) => {
    try {
      const categories = await categoryModel.findAll();
      successResponse(res, 200, 'Categorías obtenidas exitosamente', categories);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * @swagger
   * /api/categories/{id}:
   *   get:
   *     summary: Obtener categoría por ID
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la categoría
   *     responses:
   *       200:
   *         description: Categoría encontrada
   *       404:
   *         description: Categoría no encontrada
   */
  router.get('/:id', idValidation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'Datos inválidos', errors.array());
      }

      const { id } = req.params;
      const category = await categoryModel.findById(id);

      if (!category) {
        return errorResponse(res, 404, 'Categoría no encontrada');
      }

      successResponse(res, 200, 'Categoría obtenida exitosamente', category);
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      if (error.message === 'ID inválido') {
        return errorResponse(res, 400, 'ID de categoría inválido');
      }
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * @swagger
   * /api/categories:
   *   post:
   *     summary: Crear nueva categoría (solo admin)
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Categoría creada exitosamente
   *       400:
   *         description: Datos inválidos
   *       409:
   *         description: La categoría ya existe
   */
  router.post('/', categoryValidation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'Datos inválidos', errors.array());
      }

      const { name, description } = req.body;

      // Verificar si la categoría ya existe
      const existingCategory = await categoryModel.findByName(name);
      if (existingCategory) {
        return errorResponse(res, 409, 'Ya existe una categoría con ese nombre');
      }

      const categoryData = {
        name,
        description: description || null
      };

      const category = await categoryModel.create(categoryData);
      successResponse(res, 201, 'Categoría creada exitosamente', category);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      errorResponse(res, 500, 'Error interno del servidor');
    }
  });

  /**
   * @swagger
   * /api/categories/{id}:
   *   put:
   *     summary: Actualizar categoría (solo admin)
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Categoría actualizada
   */