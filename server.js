const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3001;

const moviesDir = path.join(process.cwd(), "movies");

app.use(cors());

// Serve static files (like index.html)
//app.use(express.static(__dirname));

// Serve video file
app.get("/video", (req, res) => {
  const videoPath = path.join(__dirname, "video.mp4"); // Your video file
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send("Requested range not satisfiable\n");
      return;
    }

    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(videoPath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(videoPath).pipe(res);
  }
});

// Serve subtitles (.srt or .vtt)
app.get("/subtitles", (req, res) => {
  const subtitlePath = path.join(__dirname, "sub.vtt"); // Use .vtt format for better compatibility
  res.setHeader("Content-Type", "text/vtt");
  fs.createReadStream(subtitlePath).pipe(res);
});

// Separate async function for reading movie folders
async function getAllMovies() {
  try {
    const files = await fs.promises.readdir(moviesDir, { withFileTypes: true });

    const movieFolders = files
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => ({
        name: dirent.name,
      }));

    return movieFolders;
  } catch (error) {
    console.error("Error reading movies folder:", error);
    throw new Error("Failed to read movies folder");
  }
}

// GET endpoint
app.get("/all-movies", async (req, res) => {
  try {
    const movies = await getAllMovies();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
