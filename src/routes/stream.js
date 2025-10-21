const express = require("express");
const {
  getMoiveChunk,
  getSubtitle,
} = require("../controllers/streamController");

const router = express.Router();

router.get("/getMovieChunk/:title", getMoiveChunk);
router.get("/getSubtitle/:title", getSubtitle);

module.exports = router;
