const fs = require("fs").promises;
const path = require("path");
const { generatePostersForAllMovies } = require("../services/posterGenerator");
const { listMovies } = require("../services/movieScanner");

const MOVIES_DIR = path.join(process.cwd(), "movies");

async function getAllMovies(req, res) {
  try {
    const movies = await listMovies();
    res.json(movies);
  } catch (error) {
    console.error("Error reading movies folder:", error);
    res.status(500).json({ error: "Failed to read movies folder" });
  }
}

async function makePosters(req, res) {
  try {
    await generatePostersForAllMovies();
    res.json({ status: "Posters generation completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate posters" });
  }
}

module.exports = {
  getAllMovies,
  makePosters,
};
