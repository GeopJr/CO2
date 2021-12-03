const core = require("@actions/core");
const lighthouse = require("./lighthouse.js");

/**
 * @returns {import("./calc.js").Stats | void}
 */
exports.run = async () => {
  try {
    const url = core.getInput("url", { required: true });
    if (!url || url.length == 0) throw "No url provided.";
    const res = await lighthouse.run(url);
    core.setOutput("nerds", res);
    return res;
  } catch (error) {
    core.setFailed(error.message);
  }
};
