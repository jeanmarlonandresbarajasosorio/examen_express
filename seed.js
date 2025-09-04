// backend/seed.js
const { connectDB, getDb } = require('./config/db');

async function seedMovies() {
  try {
    await connectDB();
    const db = getDb();

    const movies = [
      {
        title: "The Matrix",
        imageUrl: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg",
        ranking: 9.0,
        category: "Sci-Fi"
      },
      {
        title: "Inception",
        imageUrl: "https://upload.wikimedia.org/wikipedia/en/7/7e/Inception_ver3.jpg",
        ranking: 8.8,
        category: "Sci-Fi"
      },
      {
        title: "Interstellar",
        imageUrl: "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
        ranking: 8.6,
        category: "Sci-Fi"
      }
    ];

    await db.collection('movies').deleteMany(); // limpiar colección
    await db.collection('movies').insertMany(movies);

    console.log("✅ Seed ejecutado correctamente");
    process.exit();
  } catch (error) {
    console.error("❌ Error en el seed:", error);
    process.exit(1);
  }
}

seedMovies();