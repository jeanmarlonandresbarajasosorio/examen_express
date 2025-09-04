const path = require("path");
const fs = require("fs");
const { ObjectId } = require("mongodb");
const { createObjectCsvWriter } = require("csv-writer");
const db = require("../config/db"); 

exports.exportReviewsToCSV = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!ObjectId.isValid(movieId)) {
      return res.status(400).json({ msg: "ID de película inválido" });
    }

    const reviewsCollection = db.collection("reviews");

   
    const reviews = await reviewsCollection
      .aggregate([
        { $match: { movieId: new ObjectId(movieId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0,
            usuario: "$user.nombre",
            calificacion: "$rating",
            comentario: "$comment",
            fecha: "$createdAt",
          },
        },
      ])
      .toArray();

    if (!reviews.length) {
      return res.status(404).json({ msg: "No hay reseñas para esta película" });
    }

    const exportDir = path.join(__dirname, "..", "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    const filePath = path.join(exportDir, `reviews_${movieId}.csv`);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "usuario", title: "Usuario" },
        { id: "calificacion", title: "Calificación" },
        { id: "comentario", title: "Comentario" },
        { id: "fecha", title: "Fecha de creación" },
      ],
    });

    await csvWriter.writeRecords(reviews);

    res.status(200).json({
      msg: "Archivo CSV generado con éxito",
      file: filePath,
    });
  } catch (err) {
    next(err);
  }
};
