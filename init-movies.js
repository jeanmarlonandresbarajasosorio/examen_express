// backend/scripts/init-movies.js
// ========================================================
// Script para crear películas de ejemplo en la colección "movies"
// ========================================================

const { MongoClient } = require('mongodb');
require('dotenv').config();

const initMovies = async () => {
  let client;

  try {
    console.log('🎬 Iniciando script de películas de ejemplo...');

    // 1. Conectar a MongoDB
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    // 2. Seleccionar base de datos y colecciones
    const db = client.db('geek_movies');
    const moviesCollection = db.collection('movies');
    const categoriesCollection = db.collection('categories');

    // 3. Verificar que existan categorías
    const categories = await categoriesCollection.find({}).toArray();

    if (categories.length === 0) {
      console.log('❌ No hay categorías disponibles. Ejecuta primero init-categories.js');
      return;
    }

    console.log(`✅ Encontradas ${categories.length} categorías`);

    // 4. Buscar categorías específicas
    const animeCategory = categories.find(c => c.name === 'Anime');
    const scifiCategory = categories.find(c => c.name === 'Ciencia Ficción');
    const superheroCategory = categories.find(c => c.name === 'Superhéroes');
    const fantasyCategory = categories.find(c => c.name === 'Fantasía');
    const actionCategory = categories.find(c => c.name === 'Acción');

    // 5. Definir películas de ejemplo
    const sampleMovies = [
      {
        title: "Your Name",
        description: "Dos adolescentes comparten un vínculo profundo y mágico tras descubrir que están intercambiando cuerpos mientras duermen. Una hermosa historia de amor que trasciende el tiempo y el espacio.",
        category: animeCategory?._id || null,
        year: 2016,
        image: "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg",
        rating: 8.2,
        reviewCount: 15,
        likeCount: 12,
        approved: true
      },
      {
        title: "Spirited Away",
        description: "Una niña de 10 años entra en el mundo de los kami (espíritus de la mitología japonesa), donde los humanos son transformados en bestias. Una obra maestra de Studio Ghibli.",
        category: animeCategory?._id || null,
        year: 2001,
        image: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
        rating: 9.0,
        reviewCount: 28,
        likeCount: 25,
        approved: true
      },
      {
        title: "Blade Runner 2049",
        description: "Treinta años después de los eventos del primer filme, un nuevo blade runner, K, descubre un secreto largamente oculto que lo lleva a localizar a Rick Deckard.",
        category: scifiCategory?._id || null,
        year: 2017,
        image: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        rating: 8.0,
        reviewCount: 22,
        likeCount: 18,
        approved: true
      },
      {
        title: "Avengers: Endgame",
        description: "Después de los eventos devastadores de 'Avengers: Infinity War', el universo está en ruinas. Los Vengadores restantes se unen una vez más para deshacer las acciones de Thanos y restaurar el equilibrio del universo.",
        category: superheroCategory?._id || null,
        year: 2019,
        image: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        rating: 8.4,
        reviewCount: 35,
        likeCount: 30,
        approved: true
      },
      {
        title: "The Lord of the Rings: The Fellowship of the Ring",
        description: "Un hobbit de la Comarca y ocho compañeros que lo acompañan emprenden un viaje para destruir el poderoso Anillo Único y salvar la Tierra Media del Señor Oscuro Sauron.",
        category: fantasyCategory?._id || null,
        year: 2001,
        image: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
        rating: 8.8,
        reviewCount: 42,
        likeCount: 38,
        approved: true
      },
      {
        title: "John Wick",
        description: "Un ex-asesino a sueldo sale de su retiro forzoso para enfrentar a los matones rusos que le quitaron todo lo que él amaba. Una película de acción pura y elegante.",
        category: actionCategory?._id || null,
        year: 2014,
        image: "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
        rating: 7.4,
        reviewCount: 18,
        likeCount: 14,
        approved: true
      },
      {
        title: "Akira",
        description: "En el Neo-Tokyo de 2019, Shotaro Kaneda tiene que detener a su amigo Tetsuo Shima después de que un accidente de motocicleta le revele extraños poderes psíquicos que podrían amenazar la existencia de la ciudad.",
        category: animeCategory?._id || null,
        year: 1988,
        image: "https://image.tmdb.org/t/p/w500/gROQ1ZyKbJB3lVYqO6UBBAc4Ckr.jpg",
        rating: 8.0,
        reviewCount: 12,
        likeCount: 10,
        approved: true
      },
      {
        title: "The Matrix",
        description: "Un programador es llevado a la rebelión contra las máquinas después de descubrir que la realidad tal como él la conoce es una simulación controlada por robots cyber-inteligentes.",
        category: scifiCategory?._id || null,
        year: 1999,
        image: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        rating: 8.7,
        reviewCount: 31,
        likeCount: 28,
        approved: true
      }
    ];

    // 6. Verificar si ya existen películas
    const existingCount = await moviesCollection.countDocuments({});
    if (existingCount > 0) {
      console.log(`ℹ️  Ya existen ${existingCount} películas. Saltando inicialización.`);
      return;
    }

    // 7. Crear índices
    await moviesCollection.createIndex({ title: 1 }, { unique: true });
    await moviesCollection.createIndex({ category: 1 });
    await moviesCollection.createIndex({ year: 1 });
    await moviesCollection.createIndex({ rating: -1 });
    console.log('✅ Índices creados para películas');

    // 8. Agregar timestamps a las películas
    const moviesToInsert = sampleMovies.map(movie => ({
      ...movie,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // 9. Insertar películas
    const result = await moviesCollection.insertMany(moviesToInsert);
    console.log(`✅ ${Object.keys(result.insertedIds).length} películas creadas exitosamente`);

    // 10. Mostrar las películas creadas
    const createdMovies = await moviesCollection.find({}).toArray();
    console.log('\n🎬 Películas disponibles:');
    createdMovies.forEach(movie => {
      const categoryName = categories.find(c => c._id.toString() === movie.category?.toString())?.name || 'Sin categoría';
      console.log(`  - ${movie.title} (${movie.year}) - ${categoryName} - Rating: ${movie.rating}`);
    });

  } catch (error) {
    console.error('❌ Error inicializando películas:', error);

    if (error.code === 11000) {
      console.log("ℹ️ Ya existen películas con títulos duplicados.");
    }
  } finally {
    // 11. Cerrar conexión
    if (client) {
      await client.close();
      console.log('🔌 Conexión a MongoDB cerrada.');
    }
  }
};

// Ejecutar script
initMovies();