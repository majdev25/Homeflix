const express = require("express");
const path = require("path");
const cors = require("cors");
const movieRoutes = require("./src/routes/index.js");
const fs = require("fs");
const os = require("os");
const { exec } = require("child_process");

const {
  generatePostersForAllMovies,
} = require("./src/services/posterGenerator.js");

// Immediately generate posters on startup
generatePostersForAllMovies();

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const app = express();
const PORT = 3002;
const localIP = getLocalIP();
const serverURL = `http://${localIP}:${PORT}`;
const reactDir = path.join(process.cwd(), "react");

if (process.argv.includes("--prod")) {
  const envContent = `REACT_APP_SERVER_URL=${serverURL}`;
  fs.writeFileSync(path.join(reactDir, ".env.production"), envContent);
  console.log(`✅ Wrote .env.production with server URL: ${serverURL}`);

  console.log("📦 Building React app...");

  exec(
    `cd ${reactDir} && npm install && npm run build`,
    (err, stdout, stderr) => {
      if (err) {
        console.error("❌ React build failed:", err);
        console.error(stderr);
        return;
      }
      console.log("✅ React build completed");
      console.log(stdout);
    }
  );
}

// Middleware
app.use(cors());
app.use(express.json());

// Static movies folder (optional, for posters or media)
const moviesDir = path.join(process.cwd(), "movies");
app.use("/movies", express.static(moviesDir));

// Routes

app.use("/", movieRoutes);

app.get("/movie/:title", (req, res) => {
  const title = req.params.title;
  const movieDir = path.join(__dirname, "movies", title);

  // Check if the folder exists
  if (!fs.existsSync(movieDir)) {
    return res.status(404).send("Movie not found");
  }

  // Look for .mp4 or .mkv file in the folder
  const files = fs.readdirSync(movieDir);
  const videoFile = files.find(
    (file) => file.endsWith(".mp4") || file.endsWith(".mkv")
  );

  if (!videoFile) {
    return res.status(404).send("No video file found in movie folder");
  }

  const videoPath = path.join(movieDir, videoFile);
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
      "Content-Type": videoFile.endsWith(".mp4")
        ? "video/mp4"
        : "video/x-matroska",
    });

    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": videoFile.endsWith(".mp4")
        ? "video/mp4"
        : "video/x-matroska",
    });
    fs.createReadStream(videoPath).pipe(res);
  }
});

// Serve React static files
const reactBuildDir = path.join(process.cwd(), "react", "build");
app.use(express.static(reactBuildDir));

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "react", "build", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
