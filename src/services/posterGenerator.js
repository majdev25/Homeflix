const fs = require("fs/promises");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static");
const { MOVIES_DIR, MODELS_DIR } = require("../config/paths.js");

const canvas = require("canvas");
const faceapi = require("face-api.js");
const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-backend-cpu"); // CPU-only backend
const { getAverageColor } = require("fast-average-color-node");

const { Canvas, Image, ImageData } = canvas;

// Tell fluent-ffmpeg where to find binaries
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

// Monkey patch canvas for face-api.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(
    path.resolve(MODELS_DIR, "ssd_mobilenetv1")
  );
  console.log("Face detection model loaded");
}

// Load image from disk into a Canvas using Buffer (handles special characters)
async function loadImageToCanvas(imagePath) {
  const buffer = await fs.readFile(imagePath);
  const img = await canvas.loadImage(buffer);
  const c = canvas.createCanvas(img.width, img.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return c;
}

// Crop image around detected face
async function cropFaceToCenter(imagePath, finalOutputPath, detections) {
  const buffer = await fs.readFile(imagePath);
  const img = await canvas.loadImage(buffer);
  const imgWidth = img.width;
  const imgHeight = img.height;

  const debugOutputPath = finalOutputPath + "-debug.png";

  if (!detections.length) {
    await fs.writeFile(debugOutputPath, buffer);
    await fs.writeFile(finalOutputPath, buffer);
    console.log("No face detected, original image copied.");
    return;
  }

  const face = detections[0].box;
  const faceCenterX = face.x + face.width / 2;
  const faceCenterY = face.y + face.height / 2;

  // ---- Step 1: Draw red rectangle on original image ----
  if (process.argv.includes("--debug")) {
    const debugCanvas = canvas.createCanvas(imgWidth, imgHeight);
    const debugCtx = debugCanvas.getContext("2d");
    debugCtx.drawImage(img, 0, 0);
    debugCtx.strokeStyle = "red";
    debugCtx.lineWidth = 3;
    debugCtx.strokeRect(face.x, face.y, face.width, face.height);
    await fs.writeFile(debugOutputPath, debugCanvas.toBuffer("image/png"));
    console.log("Debug image saved:", debugOutputPath);
  }

  // ---- Step 2: Crop around the face ----

  // Distances from face center to image edges
  const distLeft = faceCenterX;
  const distRight = imgWidth - faceCenterX;
  const distTop = faceCenterY;
  const distBottom = imgHeight - faceCenterY;

  // Maximum crop sizes for X and Y separately
  const halfWidth = Math.min(distLeft, distRight);
  const halfHeight = Math.min(distTop, distBottom);

  // Crop coordinates
  const cropX = faceCenterX - halfWidth;
  const cropY = faceCenterY - halfHeight;
  const cropWidth = halfWidth * 2;
  const cropHeight = halfHeight * 2;

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
}

// Detect faces in an image
async function detectFace(imagePath) {
  const c = await loadImageToCanvas(imagePath);
  const detections = await faceapi.detectAllFaces(c);
  return detections;
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
    const colorFile = path.resolve(folderPath, "colors.json");
    await fs.writeFile(colorFile, JSON.stringify(color, null, 2));
    return color;
  } catch (err) {
    console.error("Failed to calculate average color:", err);
    return null;
  }
}

// Generate poster for a single movie folder
async function generatePosterForMovieFolder(folderName) {
  await tf.setBackend("cpu");

  const folderPath = path.resolve(MOVIES_DIR, folderName);
  const files = await fs.readdir(folderPath);
  const movieFile = files.find((f) => f.endsWith(".mp4") || f.endsWith(".mkv"));
  if (!movieFile) return null;

  const moviePath = path.resolve(folderPath, movieFile);
  const posterPath = path.resolve(folderPath, "poster.png");

  // Skip if poster already exists
  if (!process.argv.includes("--force_poster")) {
    try {
      await fs.access(posterPath);
      console.log(`Poster already exists for ${folderName}`);
      return posterPath;
    } catch {}
  }

  const duration = await getVideoDuration(moviePath);
  const maxAttempts = 20;
  let lastTempFrame = null;
  let lastDetections = [];

  for (let i = 0; i < maxAttempts; i++) {
    const randomTime = Math.random() * duration;
    const tempFramePath = path.resolve(folderPath, `temp_frame_${i}.png`);
    lastTempFrame = tempFramePath;

    // Extract frame
    await new Promise((resolve, reject) => {
      ffmpeg(moviePath)
        .screenshots({
          count: 1,
          timemarks: [randomTime],
          filename: `temp_frame_${i}.png`,
          folder: folderPath,
        })
        .on("end", resolve)
        .on("error", reject);
    });

    // wait until file exists (Windows special chars workaround)
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await fs.access(tempFramePath);
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 50));
      }
    }

    const detections = await detectFace(tempFramePath);
    lastDetections = detections.sort((a, b) => {
      const areaA = a.box.width * a.box.height;
      const areaB = b.box.width * b.box.height;
      return areaB - areaA; // descending order
    });
    if (detections && detections.length > 0) {
      await cropFaceToCenter(tempFramePath, posterPath, detections);
      await saveAverageColor(posterPath);
      await fs.unlink(tempFramePath);
      console.log(`Poster created for ${folderName}`);
      return posterPath;
    } else {
      if (i < maxAttempts - 1) await fs.unlink(tempFramePath);
    }
  }

  // fallback: use last frame
  await cropFaceToCenter(lastTempFrame, posterPath, lastDetections || []);
  await saveAverageColor(posterPath);
  await fs.unlink(lastTempFrame);
  console.log(`No face found for ${folderName}, using last frame`);
}

// Generate posters for all movies
async function generatePostersForAllMovies() {
  const entries = await fs.readdir(MOVIES_DIR, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  await loadModels();

  for (const folder of folders) {
    await generatePosterForMovieFolder(folder);
  }
  return;
}

module.exports = {
  generatePosterForMovieFolder,
  generatePostersForAllMovies,
  saveAverageColor,
};
