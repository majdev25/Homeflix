const fs = require("fs").promises;
const path = require("path");
const { generatePostersForAllMovies } = require("../services/posterGenerator");
const {
  listMovies,
  writeProgress,
  readProgress,
} = require("../services/movieUtils");

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

async function saveProgress(req, res) {
  try {
    const { title, position } = req.body;

    if (!title || position == null) {
      return res.status(400).json({ error: "Missing title or position" });
    }

    const data = {
      position,
      updatedAt: new Date().toISOString(),
    };

    writeProgress(data, title);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

async function getProgress(req, res) {
  try {
    const { title } = req.params;
    const data = await readProgress(title);

    const movieProgress = data;
    if (!movieProgress) return res.json({ position: 0 });

    res.json({ position: movieProgress.position });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get progress" });
  }
}

module.exports = {
  getAllMovies,
  makePosters,
  saveProgress,
  getProgress,
};
