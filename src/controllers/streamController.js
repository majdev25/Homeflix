const fs = require("fs");
const path = require("path");
const { convertToVtt } = require("../services/subtitleConverter");

const { MOVIES_DIR } = require("../config/paths.js");

async function getMoiveChunk(req, res) {
  try {
    const title = req.params.title;
    const movieDir = path.join(MOVIES_DIR, title);

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send movie chunk." });
  }
}

async function getSubtitle(req, res) {
  try {
    const title = req.params.title;
    const movieDir = path.join(MOVIES_DIR, title);

    if (!fs.existsSync(movieDir)) {
      return res.status(404).send("Movie not found");
    }

    const files = fs.readdirSync(movieDir);
    const subtitleFile = files.find((file) =>
      [".vtt", ".srt", ".ass", ".sub"].some((ext) => file.endsWith(ext))
    );

    if (!subtitleFile) {
      return res.status(404).send("No subtitle file found in movie folder");
    }

    const subtitlePath = path.join(movieDir, subtitleFile);

    // Cache headers
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Convert to VTT and send
    const vttData = await convertToVtt(subtitlePath);

    res.writeHead(200, { "Content-Type": "text/vtt" });
    res.end(vttData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to return subtitle." });
  }
}

module.exports = {
  getMoiveChunk,
  getSubtitle,
};
