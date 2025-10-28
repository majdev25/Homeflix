const fs = require("fs").promises;
const path = require("path");
const { MOVIES_DIR } = require("../config/paths.js");
const { getVideoDuration, getMoviePath } = require("./posterGenerator.js");

async function listMovies() {
  const entries = await fs.readdir(MOVIES_DIR, { withFileTypes: true });
  const movies = [];

  for (const e of entries) {
    if (!e.isDirectory()) continue;

    const folderPath = path.join(MOVIES_DIR, e.name);
    const posterPath = `${e.name}/poster.png`;
    const colorPath = path.join(folderPath, "colors.json");
    const imdbPath = path.join(folderPath, "imdb-data.json");

    // --- Read color ---
    let color = null;
    try {
      const colorData = await fs.readFile(colorPath, "utf-8");
      color = JSON.parse(colorData);
    } catch {}

    // --- Read IMDB data ---
    let imdbData = null;
    try {
      const imdbRaw = await fs.readFile(imdbPath, "utf-8");
      imdbData = JSON.parse(imdbRaw);
    } catch {}

    // --- Read progress ---
    let progress = 0;
    try {
      const progressData = await readProgress(e.name);
      const { position = 0 } = progressData;

      const moviePath = await getMoviePath(e.name);
      const duration = await getVideoDuration(moviePath);

      if (duration) {
        progress = Math.min((position / duration) * 100, 100);
      }
    } catch {}

    movies.push({
      title: e.name,
      posterPath,
      color,
      imdbData,
      progress, // 0-100
    });
  }

  return movies;
}

async function writeProgress(data, folderName) {
  const file_path = path.resolve(MOVIES_DIR, folderName, "progress.json");
  await fs.writeFile(file_path, JSON.stringify(data, null, 2));
}

async function readProgress(folderName) {
  const file_path = path.resolve(MOVIES_DIR, folderName, "progress.json");
  try {
    const data = await fs.readFile(file_path, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      // File does not exist — normal, return empty object
      return {};
    } else {
      // Some other error
      console.error("Error reading progress file:", err);
      throw err;
    }
  }
}

module.exports = { listMovies, writeProgress, readProgress };
