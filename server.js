// =====================================
// PUNTO DE ENTRADA DEL SERVIDOR
// =====================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, getDb } = require('./config/db');

const app = express();

// =====================
// Middlewares globales
// =====================
app.use(cors()); // Habilitar peticiones desde cualquier origen (Frontend)
app.use(express.json()); // Parsear JSON en request.body

// =====================
// Inicializar aplicación
// =====================
const initializeApp = async () => {
  try {
    // 🔌 Conexión a la base de datos
    await connectDB();
    const db = getDb();

    // Crear índices básicos (sin usar los modelos por ahora)
    await createBasicIndexes(db);

    // =====================
    // Rutas principales
    // =====================
    app.use('/api/auth', require('./routes/auth.routes'));   // Rutas de autenticación

    // Rutas de películas - inicializar con la base de datos
    const movieRoutes = require('./routes/movie.routes');
    app.use('/api/movies', movieRoutes(db));

    // Rutas de categorías - crear versión simple
    app.use('/api/categories', createCategoryRoutes(db));

    // Ruta de prueba para verificar servidor
    app.get('/', (req, res) => {
      res.json({
        success: true,
        message: '✅ API de Peliscore funcionando correctamente 🚀',
        endpoints: {
          auth: '/api/auth',
          movies: '/api/movies',
          categories: '/api/categories',
          health: '/api/health'
        }
      });
    });

    // Ruta de salud del sistema
    app.get('/api/health', async (req, res) => {
      try {
        // Verificar conexión a DB
        await db.admin().ping();
        
        res.json({
          success: true,
          message: 'Sistema funcionando correctamente',
          database: 'Conectada',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error en el sistema',
          database: 'Desconectada',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Middleware para rutas no encontradas
    app.use('/api/*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado',
        requested: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    });

    // Middleware global de manejo de errores
    app.use((err, req, res, next) => {
      console.error('❌ Error no manejado:', err);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    });

    // =====================
    // Arranque del servidor
    // =====================
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📚 API disponible en http://localhost:${PORT}/api`);
      console.log(`🎬 Movies endpoint: http://localhost:${PORT}/api/movies`);
      console.log(`🏷️  Categories endpoint: http://localhost:${PORT}/api/categories`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
    });

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// =====================
// Función para crear índices básicos
// =====================
const createBasicIndexes = async (db) => {
  try {
    console.log('📊 Creando índices básicos...');
    
    // Índices para películas
    await db.collection('movies').createIndex({ title: 1 }, { unique: true });
    await db.collection('movies').createIndex({ category: 1 });
    await db.collection('movies').createIndex({ year: 1 });
    await db.collection('movies').createIndex({ rating: -1 });
    await db.collection('movies').createIndex({ createdAt: -1 });
    
    // Índices para categorías
    await db.collection('categories').createIndex({ name: 1 }, { unique: true });
    
    console.log('✅ Índices creados correctamente');
  } catch (error) {
    console.warn('⚠️  Warning: Error creando índices:', error.message);
    // No hacer exit aquí, los índices son importantes pero no críticos para el arranque
  }
};

// =====================
// Rutas simples de categorías
// =====================
const createCategoryRoutes = (db) => {
  const express = require('express');
  const router = express.Router();
  const categoriesCollection = db.collection('categories');

  // GET /api/categories - Obtener todas las categorías
  router.get('/', async (req, res) => {
    try {
      const categories = await categoriesCollection.find({}).sort({ name: 1 }).toArray();
      res.json({
        success: true,
        message: 'Categorías obtenidas exitosamente',
        data: categories,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  });

  // GET /api/categories/:id - Obtener categoría por ID
  router.get('/:id', async (req, res) => {
    try {
      const { ObjectId } = require('mongodb');
      const { id } = req.params;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de categoría inválido',
          timestamp: new Date().toISOString()
        });
      }

      const category = await categoriesCollection.findOne({ _id: new ObjectId(id) });
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada',
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Categoría obtenida exitosamente',
        data: category,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  });

  return router;
};

// =====================
// Manejo de cierre graceful
// =====================
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Inicializar aplicación
initializeApp();