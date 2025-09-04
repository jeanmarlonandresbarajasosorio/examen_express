// backend/models/movie.model.js
// =====================================
// MODELO DE PELÍCULAS (Driver Oficial MongoDB - Opción 1)
// Usamos funciones puras que reciben la conexión desde db.js
// =====================================

const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");

// Nombre de la colección
const MOVIE_COLLECTION = "movies";

/**
 * Obtiene la colección de películas.
 * @returns {Collection} referencia a la colección en MongoDB
 */
function getMovieCollection() {
  const db = getDb();
  return db.collection(MOVIE_COLLECTION);
}

/**
 * Obtiene todas las películas con paginación.
 */
async function getAll({ page = 1, limit = 12, category }) {
  const skip = (page - 1) * limit;
  const query = category ? { category: new ObjectId(category) } : {};

  const collection = getMovieCollection();

  const [movies, total] = await Promise.all([
    collection.find(query).skip(skip).limit(limit).toArray(),
    collection.countDocuments(query)
  ]);

  return {
    movies,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}

/**
 * Obtiene una película por ID.
 */
async function getById(id) {
  const collection = getMovieCollection();
  return await collection.findOne({ _id: new ObjectId(id) });
}

/**
 * Crea una nueva película.
 */
async function create(data) {
  const collection = getMovieCollection();
  const result = await collection.insertOne({
    ...data,
    createdAt: new Date(),
    approved: false,
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0
  });
  return await getById(result.insertedId);
}

/**
 * Actualiza una película.
 */
async function update(id, data) {
  const collection = getMovieCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  return result.value;
}

/**
 * Elimina una película.
 */
async function remove(id) {
  const collection = getMovieCollection();
  const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });
  return result.value;
}

/**
 * Aprueba una película.
 */
async function approve(id) {
  const collection = getMovieCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { approved: true, approvedAt: new Date() } },
    { returnDocument: "after" }
  );
  return result.value;
}

/**
 * Obtiene películas populares.
 */
async function getPopular(limit = 6) {
  const collection = getMovieCollection();
  return await collection.find({ approved: true })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Obtiene películas recientes.
 */
async function getRecent(limit = 6) {
  const collection = getMovieCollection();
  return await collection.find({ approved: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  approve,
  getPopular,
  getRecent
};