const express = require("express");
const moviesRouter = require("./movies");

const router = express.Router();

// Combine all routes here
router.use("/movies", moviesRouter);

module.exports = router;
