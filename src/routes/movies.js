const express = require("express");
const {
  getAllMovies,
  saveProgress,
  getProgress,
} = require("../controllers/moviesController");

const router = express.Router();

router.get("/all-movies", getAllMovies);
router.post("/save-progress", saveProgress);
router.get("/get-progress/:title", getProgress);

module.exports = router;
