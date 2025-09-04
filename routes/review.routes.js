const express = require("express");
const router = express.Router();
const { exportReviewsToCSV } = require("../controllers/reviewController");
const passport = require("passport");

router.get(
  "/export/:movieId",
  passport.authenticate("jwt", { session: false }),
  exportReviewsToCSV
);

module.exports = router;
