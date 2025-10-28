const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static");
const path = require("path");
const { MOVIES_DIR } = require("../config/paths.js");
const fs = require("fs/promises");

const { getSettings } = require("../../initSettings.js");

// Tell fluent-ffmpeg where to find binaries
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

// Get video duration in seconds
function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

// Return video file by movie name
async function getMoviePath(folderName) {
  const folderPath = path.resolve(MOVIES_DIR, folderName);
  const files = await fs.readdir(folderPath);
  const movieFile = files.find((f) => f.endsWith(".mp4") || f.endsWith(".mkv"));
  if (!movieFile) return null;
  const moviePath = path.resolve(folderPath, movieFile);
  return moviePath;
}

// Return all movie folders
async function getAllMovieFolders() {
  const entries = await fs.readdir(MOVIES_DIR, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  return folders;
}

async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

// Return all movies with their data
async function listMovies() {
  const entries = await fs.readdir(MOVIES_DIR, { withFileTypes: true });
  const movies = [];

  const settings = await getSettings();

  for (const e of entries) {
    if (!e.isDirectory()) continue;

    const folderPath = path.join(MOVIES_DIR, e.name);
    let posterPath = ``;

    if (
      settings.useAIPoster &&
      (await fileExists(`${path.join(MOVIES_DIR, e.name)}/poster.png`))
    ) {
      posterPath = `${e.name}/poster.png`;
    } else {
      posterPath = null;
    }

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
    if (settings.useImdbAPI) {
      try {
        const imdbRaw = await fs.readFile(imdbPath, "utf-8");
        imdbData = JSON.parse(imdbRaw);
      } catch {}
    }

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
      progress,
    });
  }

  return movies;
}

// Write watched progress to file
async function writeProgress(data, folderName) {
  const file_path = path.resolve(MOVIES_DIR, folderName, "progress.json");
  await fs.writeFile(file_path, JSON.stringify(data, null, 2));
}

// Read watched progress to file
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

module.exports = {
  getVideoDuration,
  getMoviePath,
  ffmpeg,
  listMovies,
  writeProgress,
  readProgress,
  getAllMovieFolders,
};
