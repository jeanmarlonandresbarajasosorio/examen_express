// config/swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Geek Movies API",
      version: "1.0.0",
      description: "API CRUD para la app Geek Movies con Node.js, Express y MongoDB",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"], // Documenta rutas y modelos
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };