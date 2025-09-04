// backend/config/db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

/**
 * Conecta con MongoDB Atlas y guarda la referencia en la variable db.
 */
const connectDB = async () => {
  try {
    await client.connect();
    db = client.db('geek_movies');
    console.log("✅ Conexión a MongoDB Atlas (Driver Oficial) exitosa");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB Atlas:", error);
    process.exit(1);
  }
};

/**
 * Devuelve la referencia a la base de datos actual.
 */
const getDb = () => {
  if (!db) {
    throw new Error('❌ La base de datos no está inicializada. Llama a connectDB primero.');
  }
  return db;
};

module.exports = { connectDB, getDb };