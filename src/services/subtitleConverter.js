const fs = require("fs");
const path = require("path");

/**
 * Convert subtitle file to WebVTT (.vtt) format on the fly.
 * Supports .srt, .ass, .sub, .vtt
 * Returns string ready to send in response.
 */
async function convertToVtt(subtitlePath) {
  const ext = path.extname(subtitlePath).toLowerCase();

  if (ext === ".vtt") {
    // Already VTT, just return content
    return fs.readFileSync(subtitlePath, "utf8");
  }

  if (ext === ".srt") {
    // Convert SRT → VTT
    const srtData = fs.readFileSync(subtitlePath, "utf8");
    const vttData =
      "WEBVTT\n\n" +
      srtData
        .replace(/\r+/g, "")
        .replace(/^\s+|\s+$/g, "")
        .split("\n\n")
        .map((block) =>
          block
            .replace(/^\d+\s*$/, "") // remove index line
            .replace(
              /(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})/g,
              "$1.$2 --> $3.$4"
            )
        )
        .join("\n\n");

    return vttData;
  }

  if (ext === ".ass" || ext === ".sub") {
    // Basic conversion: fallback to plain text with WEBVTT header
    const data = fs.readFileSync(subtitlePath, "utf8");
    return "WEBVTT\n\n" + data;
  }

  // Unknown format, just return as plain text
  return fs.readFileSync(subtitlePath, "utf8");
}

module.exports = { convertToVtt };
