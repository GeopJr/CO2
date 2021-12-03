// This file is responsible for calling lighthouse to count
// transferred bytes + call the calculation functions

const core = require("@actions/core");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const calc = require("./calc.js");

/**
 * @returns {string} Stringified {calc.Stats} (safe to parse)
 */
exports.run = async () => {
  const url = core.getInput("url", { required: true });
  try {
    const chrome = await chromeLauncher.launch({
      chromeFlags: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--headless",
      ],
    });
    const options = {
      port: chrome.port,
    };
    const runnerResult = await lighthouse(url, options);

    let bytes = 0;
    runnerResult.lhr.audits["network-requests"].details.items.forEach(
      (resource) => {
        bytes = bytes + resource.transferSize;
      }
    );

    await chrome.kill();

    return JSON.stringify(calc.genData(bytes));
  } catch (error) {
    core.error(error.message);
    core.setFailed("Lighthouse audit errored");
  }
};
