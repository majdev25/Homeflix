const express = require("express");
const moviesRouter = require("./movies");
const streamRouter = require("./stream");

const router = express.Router();

// Combine all routes here
router.use("/movies", moviesRouter);
router.use("/stream", streamRouter);

module.exports = router;
