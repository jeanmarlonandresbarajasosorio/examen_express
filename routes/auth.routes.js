const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const { registerValidator, loginValidator } = require("../utils/validators");

const router = express.Router();

// Rutas de autenticación
router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

module.exports = router;