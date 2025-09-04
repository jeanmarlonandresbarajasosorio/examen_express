// backend/utils/response.js

/**
 * Envía una respuesta exitosa estandarizada
 * @param {Object} res - Response object de Express
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} message - Mensaje descriptivo
 * @param {*} data - Datos a enviar (opcional)
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Envía una respuesta de error estandarizada
 * @param {Object} res - Response object de Express
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} message - Mensaje de error
 * @param {*} errors - Errores específicos (opcional)
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};