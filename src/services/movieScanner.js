const fs = require("fs").promises;
const path = require("path");
const { MOVIES_DIR } = require("../config/paths.js");

async function listMovies() {
  const entries = await fs.readdir(MOVIES_DIR, { withFileTypes: true });

  const movies = [];

  for (const e of entries) {
    if (!e.isDirectory()) continue;

    const folderPath = path.join(MOVIES_DIR, e.name);
    const posterPath = `${e.name}/poster.png`;
    const colorPath = path.join(folderPath, "colors.json");

    let color = null;
    try {
      const colorData = await fs.readFile(colorPath, "utf-8");
      color = JSON.parse(colorData);
    } catch (err) {
      // colors.json may not exist yet
      color = null;
    }

    movies.push({
      title: e.name,
      posterPath,
      color,
    });
  }

  return movies;
}

module.exports = { listMovies };
