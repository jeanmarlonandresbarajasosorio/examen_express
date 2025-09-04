const { body } = require("express-validator");

const registerValidator = [
  body("name").notEmpty().withMessage("El nombre es requerido"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener mínimo 6 caracteres"),
];

const loginValidator = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
];

module.exports = { registerValidator, loginValidator };