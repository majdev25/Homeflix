const path = require("path");

const ROOT_DIR = process.cwd();
const MOVIES_DIR = path.join(ROOT_DIR, "movies");
const MODELS_DIR = path.join(ROOT_DIR, "src/models");

module.exports = {
  ROOT_DIR,
  MOVIES_DIR,
  MODELS_DIR,
};
