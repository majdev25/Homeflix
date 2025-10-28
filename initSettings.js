const readline = require("readline");
const fs = require("fs/promises");

// Universal yes/no interactive prompt
function askYesNo(question) {
  return new Promise((resolve) => {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    const options = ["Yes", "No"];
    let selectedIndex = 0;

    function render() {
      process.stdout.write("\r" + question + " ");
      options.forEach((option, i) => {
        if (i === selectedIndex) {
          process.stdout.write(`[${option}] `);
        } else {
          process.stdout.write(`${option} `);
        }
      });
    }

    render();

    function onKeypress(str, key) {
      if (key.name === "left" || key.name === "h") {
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        render();
      } else if (key.name === "right" || key.name === "l") {
        selectedIndex = (selectedIndex + 1) % options.length;
        render();
      } else if (key.name === "return") {
        process.stdin.removeListener("keypress", onKeypress);
        process.stdin.setRawMode(false);
        console.log("\n"); // move to next line
        resolve(selectedIndex === 0); // true if Yes, false if No
      } else if (key.ctrl && key.name === "c") {
        process.exit();
      }
    }

    process.stdin.on("keypress", onKeypress);
  });
}

// Reads settings file
async function getSettings() {
  const filePath = "./settings.json";
  try {
    const settings = await fs.readFile(filePath, "utf-8");
    return JSON.parse(settings);
  } catch {
    return null;
  }
}

// Initializes settings
async function initSettings() {
  const filePath = "./settings.json";

  const existingSettings = await getSettings(filePath);
  if (existingSettings) return existingSettings;

  // Ask user for settings if file doesn't exist
  const useAIPoster = await askYesNo(
    "Do you want to use AI-generated face poster?"
  );
  const useImdbAPI = await askYesNo("Do you want to use IMDB API?");

  const settings = {
    useAIPoster,
    useImdbAPI,
    settingsVersion: "1",
  };

  // Save settings to file
  await fs.writeFile(filePath, JSON.stringify(settings, null, 2), "utf-8");

  return settings;
}

module.exports = {
  initSettings,
  getSettings,
};
