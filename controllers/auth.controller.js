// backend/controllers/auth.controller.js

const { getDb } = require('../config/db'); // Importamos la función para obtener la DB
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

// --- Controlador para registrar un nuevo usuario ---
const register = async (req, res) => {
  try {
    const db = getDb(); // Obtenemos la instancia de la base de datos
    const { username, email, password } = req.body;

    // 1. Verificar si el usuario ya existe
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Crear el nuevo objeto de usuario
    const newUser = {
      username,
      email,
      password: hashedPassword,
      role: 'user', // Rol por defecto
      createdAt: new Date(),
    };

    // 4. Insertar el nuevo usuario en la colección 'users'
    const result = await db.collection('users').insertOne(newUser);
    
    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertedId });

  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).send('Error en el servidor');
  }
};

// --- Controlador para iniciar sesión ---
const login = async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body;

    // 1. Buscar al usuario por su email
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // 2. Comparar la contraseña ingresada con la encriptada en la DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // 3. Crear y firmar el JSON Web Token (JWT)
    const payload = {
      user: {
        id: user._id, // Usamos _id que viene de MongoDB
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role, message: 'Login exitoso' });
      }
    );
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).send('Error en el servidor');
  }
};


module.exports = {
  register,
  login,
};