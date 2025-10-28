const fs = require("fs/promises");
const path = require("path");
const { MOVIES_DIR, MODELS_DIR } = require("../config/paths.js");
const { getAllMovieFolders } = require("./movieUtils.js");

// Fetch movie data
async function fetchDataForMovieFolder(folderName) {
  const folderPath = path.join(MOVIES_DIR, folderName);
  const query = encodeURIComponent(folderName);
  const searchUrl = `https://api.imdbapi.dev/search/titles?query=${query}&limit=1`;

  const filePath = path.join(folderPath, "imdb-data.json");

  try {
    await fs.access(filePath);
    console.log(`IMDB alredy fetched for ${folderName}`);
    return;
  } catch {}

  try {
    // Step 1: Search for the movie
    const searchResp = await fetch(searchUrl);
    if (!searchResp.ok) throw new Error(`Search failed: ${searchResp.status}`);
    const searchData = await searchResp.json();

    if (!searchData.titles || searchData.titles.length === 0) {
      console.warn(`No results found for "${folderName}"`);
      return;
    }

    // Get IMDb ID from search results
    const movieId = searchData.titles[0].id;
    const detailsUrl = `https://api.imdbapi.dev/titles/${movieId}`;

    // Step 2: Fetch full movie details
    const detailsResp = await fetch(detailsUrl);
    if (!detailsResp.ok)
      throw new Error(`Details fetch failed: ${detailsResp.status}`);
    const movieData = await detailsResp.json();

    // Save the data
    await fs.writeFile(filePath, JSON.stringify(movieData, null, 2), "utf-8");

    console.log(`Saved IMDb data for "${folderName}"`);
  } catch (err) {
    console.error(`Error fetching data for "${folderName}":`, err.message);
  }
}

// Get all folders
async function fetchMovieDataForAllMovies() {
  const folders = await getAllMovieFolders();

  for (const folder of folders) {
    await fetchDataForMovieFolder(folder);
  }
  return;
}

module.exports = {
  fetchMovieDataForAllMovies,
};
