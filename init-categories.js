// backend/scripts/init-categories.js
// Script para crear categorías iniciales
const { MongoClient } = require('mongodb');
require('dotenv').config();

const defaultCategories = [
  {
    name: 'Anime',
    description: 'Películas y series de animación japonesa'
  },
  {
    name: 'Ciencia Ficción',
    description: 'Películas del género de ciencia ficción'
  },
  {
    name: 'Superhéroes',
    description: 'Películas de superhéroes y cómics'
  },
  {
    name: 'Fantasía',
    description: 'Películas del género fantástico'
  },
  {
    name: 'Horror',
    description: 'Películas de terror y suspense'
  },
  {
    name: 'Acción',
    description: 'Películas de acción y aventura'
  }
];

const initCategories = async () => {
  let client;
  
  try {
    console.log('🚀 Iniciando script de categorías...');
    
    // Conectar a MongoDB
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db('geek_movies');
    const categoriesCollection = db.collection('categories');
    
    // Verificar si ya existen categorías
    const existingCount = await categoriesCollection.countDocuments({});
    
    if (existingCount > 0) {
      console.log(`ℹ️  Ya existen ${existingCount} categorías. Saltando inicialización.`);
      return;
    }
    
    // Crear índice único para el nombre
    await categoriesCollection.createIndex({ name: 1 }, { unique: true });
    console.log('✅ Índice creado para categorías');
    
    // Insertar categorías con timestamps
    const categoriesToInsert = defaultCategories.map(category => ({
      ...category,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const result = await categoriesCollection.insertMany(categoriesToInsert);
    console.log(`✅ ${result.insertedCount} categorías creadas exitosamente`);
    
    // Mostrar las categorías creadas
    const createdCategories = await categoriesCollection.find({}).toArray();
    console.log('\n📋 Categorías disponibles:');
    createdCategories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat._id})`);
    });
    
  } catch (error) {
    console.error('❌ Error inicializando categorías:', error);
    
    if (error.code === 11000) {
      console.log('ℹ️  Algunas categorías ya existen. Esto es normal.');
    }
  } finally {
    if (client) {
      await client.close();
      console.log('✅ Conexión cerrada');
    }
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  initCategories()
    .then(() => {
      console.log('🎉 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en script:', error);
      process.exit(1);
    });
}

module.exports = { initCategories, defaultCategories };