// backend/models/user.model.js

const mongoose = require('mongoose');

// 1. Definimos el esquema (la estructura de los datos)
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Solo permite estos dos valores
    default: 'user', // Valor por defecto
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 2. Creamos y exportamos el modelo a partir del esquema
// Mongoose usará este modelo para interactuar con la colección 'users' en MongoDB
module.exports = mongoose.model('User', UserSchema);