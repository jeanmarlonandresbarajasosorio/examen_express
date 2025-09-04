import { Router } from "express";
import {
  getReviewsByMovie,
  createReview,
  updateReview,
  deleteReview
} from "../controllers/review.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/:movieId", getReviewsByMovie);
router.post("/:movieId", authMiddleware, createReview);
router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

export default router;