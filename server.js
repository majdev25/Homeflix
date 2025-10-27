const express = require("express");
const path = require("path");
const cors = require("cors");
const apiRoutes = require("./src/routes/index.js");
const fs = require("fs");
const os = require("os");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

const {
  generatePostersForAllMovies,
} = require("./src/services/posterGenerator");

const {
  fetchMovieDataForAllMovies,
} = require("./src/services/imdb-fetcher.js");

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

async function buildReactApp() {
  const reactDir = path.join(process.cwd(), "react");
  const localIP = getLocalIP();
  const serverURL = `http://${localIP}:${PORT}`;
  const envContent = `REACT_APP_SERVER_URL=${serverURL}`;

  fs.writeFileSync(path.join(reactDir, ".env.production"), envContent);

  try {
    console.log("📦 Building React app...");
    await execAsync(`cd ${reactDir} && npm install && npm run build`);
    console.log("✅ React build completed");
  } catch (err) {
    console.error("❌ React build failed:", err.stderr || err);
  }
}

(async () => {
  if (process.argv.includes("--prod")) {
    await buildReactApp();
  }

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Static movies folder for posters
  const moviesDir = path.join(process.cwd(), "movies");
  app.use("/static/movies", express.static(moviesDir));

  // Routes
  app.use("/api", apiRoutes);

  // Serve React static files
  const reactBuildDir = path.join(process.cwd(), "react", "build");
  app.use(express.static(reactBuildDir));

  // Serve React app for all other routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(reactBuildDir, "index.html"));
  });

  await generatePostersForAllMovies();
  await fetchMovieDataForAllMovies();

  // Start server
  app.listen(PORT, () => {
    const localIP = getLocalIP();
    const serverURL = `http://${localIP}:${PORT}`;
    if (process.argv.includes("--prod")) {
      console.log(`✅ Server running at ${serverURL}`);
    } else {
      console.log(`✅ Server running at ${serverURL}`);
    }
  });
})();
