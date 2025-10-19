const express = require("express");
const { getAllMovies } = require("../controllers/moviesController");

const router = express.Router();

router.get("/all-movies", getAllMovies);

module.exports = router;
