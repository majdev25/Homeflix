const fs = require("fs/promises");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static");
const { MOVIES_DIR } = require("../config/paths.js");

const tf = require("@tensorflow/tfjs-node");
const blazeface = require("@tensorflow-models/blazeface");
const canvas = require("canvas");
const { getAverageColor } = require("fast-average-color-node");

const { Canvas, Image, ImageData } = canvas;

// Tell fluent-ffmpeg where to find the binaries
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

// Load image from disk into a Canvas
async function loadImageToCanvas(imagePath) {
  const img = await canvas.loadImage(imagePath);
  const c = canvas.createCanvas(img.width, img.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return c;
}

// Crop image so that face is slightly right-of-center and vertically centered
async function cropFaceToCenter(imagePath, finalOutputPath, predictions) {
  const img = await canvas.loadImage(imagePath);
  const imgWidth = img.width;
  const imgHeight = img.height;

  const debugOutputPath = finalOutputPath + "-debug.png";

  if (!predictions.length) {
    const buffer = await fs.readFile(imagePath);
    await fs.writeFile(debugOutputPath, buffer);
    await fs.writeFile(finalOutputPath, buffer);
    console.log("No face detected, original images copied.");
    return;
  }

  const face = predictions[0];
  const [x1, y1] = face.topLeft;
  const [x2, y2] = face.bottomRight;
  const faceCenterX = (x1 + x2) / 2;
  const faceCenterY = (y1 + y2) / 2;

  // ---- Step 1: Draw red rectangle on original image ----
  const debugCanvas = canvas.createCanvas(imgWidth, imgHeight);
  const debugCtx = debugCanvas.getContext("2d");
  debugCtx.drawImage(img, 0, 0);
  debugCtx.strokeStyle = "red";
  debugCtx.lineWidth = 3;
  debugCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  await fs.writeFile(debugOutputPath, debugCanvas.toBuffer("image/png"));
  console.log("Debug image saved:", debugOutputPath);

  // ---- Step 2: Crop around the face ----
  const margin = Math.max(x2 - x1, y2 - y1) * 2;
  let cropX = faceCenterX - margin / 2;
  let cropY = faceCenterY - margin / 2;
  let cropWidth = margin;
  let cropHeight = margin;

  // Make sure crop stays within image
  if (cropX < 0) cropX = 0;
  if (cropY < 0) cropY = 0;
  if (cropX + cropWidth > imgWidth) cropWidth = imgWidth - cropX;
  if (cropY + cropHeight > imgHeight) cropHeight = imgHeight - cropY;

  const finalCanvas = canvas.createCanvas(cropWidth, cropHeight);
  const finalCtx = finalCanvas.getContext("2d");
  finalCtx.drawImage(
    img,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  await fs.writeFile(finalOutputPath, finalCanvas.toBuffer("image/png"));
  console.log("Cropped image saved:", finalOutputPath);
}

// Detect if an image has any face
async function detectFace(imagePath, model) {
  const c = await loadImageToCanvas(imagePath);
  const predictions = await model.estimateFaces(c, false);
  return predictions;
}

// Get video duration in seconds
function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

// Save average color for poster
async function saveAverageColor(posterPath) {
  try {
    const color = await getAverageColor(posterPath);
    const folderPath = path.dirname(posterPath);
    const colorFile = path.join(folderPath, "colors.json");
    await fs.writeFile(colorFile, JSON.stringify(color, null, 2));
    console.log(`Saved average color for ${folderPath}: ${color.hex}`);
    return color;
  } catch (err) {
    console.error("Failed to calculate average color:", err);
    return null;
  }
}

// Generate poster for a single movie folder
async function generatePosterForMovieFolder(folderName) {
  await tf.ready();
  const modelPath = `file://${path.resolve(__dirname, "../models/model.json")}`;
  const model = await blazeface.load({
    modelUrl: modelPath,
  });

  const folderPath = path.join(MOVIES_DIR, folderName);
  const files = await fs.readdir(folderPath);
  const movieFile = files.find((f) => f.endsWith(".mp4") || f.endsWith(".mkv"));
  if (!movieFile) return null;

  const moviePath = path.join(folderPath, movieFile);
  const posterPath = path.join(folderPath, "poster.png");

  // Skip if poster already exists
  try {
    await fs.access(posterPath);
    console.log(`Poster already exists for ${folderName}`);
    return posterPath;
  } catch {}

  const duration = await getVideoDuration(moviePath);
  const maxAttempts = 10;
  let lastTempFrame = null;

  let lastPredictions = [];

  for (let i = 0; i < maxAttempts; i++) {
    const randomTime = Math.random() * duration;
    const tempFramePath = path.join(folderPath, `temp_frame_${i}.png`);
    lastTempFrame = tempFramePath;

    // Extract frame
    await new Promise((resolve, reject) => {
      ffmpeg(moviePath)
        .on("end", resolve)
        .on("error", reject)
        .screenshots({
          count: 1,
          timemarks: [randomTime],
          filename: `temp_frame_${i}.png`,
          folder: folderPath,
        });
    });

    const predictions = await detectFace(tempFramePath, model);
    lastPredictions = predictions;
    if (predictions && predictions.length > 0) {
      await cropFaceToCenter(tempFramePath, posterPath, predictions);
      await saveAverageColor(posterPath);
      await fs.unlink(tempFramePath);
      console.log(`Poster created for ${folderName} with centered face`);
      return posterPath;
    } else {
      if (i < maxAttempts - 1) await fs.unlink(tempFramePath);
    }
  }

  // fallback: use last frame
  await cropFaceToCenter(lastTempFrame, posterPath, lastPredictions || []);
  await saveAverageColor(posterPath);
  await fs.unlink(lastTempFrame);
  console.log(`No face found for ${folderName}, using last frame`);
}

// Generate posters for all movies
async function generatePostersForAllMovies() {
  const entries = await fs.readdir(MOVIES_DIR, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  for (const folder of folders) {
    await generatePosterForMovieFolder(folder);
  }
}

// Export everything
module.exports = {
  generatePosterForMovieFolder,
  generatePostersForAllMovies,
  saveAverageColor,
};
