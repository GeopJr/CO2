// This file is responsible for calling the greenwebfoundation's greencheck API
// and handling the result

const core = require("@actions/core");
const https = require("https");
const url = `https://api.thegreenwebfoundation.org/greencheck/${encodeURIComponent(
  new URL(core.getInput("url", { required: true })).host
)}`;

/**
 * @returns {Promise<boolean> | Promise<void> | void}
 */
exports.run = async () => {
  if (!core.getBooleanInput("renewable")) {
    return;
  }
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            resolve(JSON.parse(body).green);
          } catch (error) {
            console.error(error.message);
          }
        });
      })
      .on("error", (error) => {
        console.error(error.message);
      });
  });
};
