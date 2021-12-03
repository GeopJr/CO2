// This file is responsible for calling the others
// as well as transfer info between them

const renewable = require("./src/renewable.js");
const comment = require("./src/comment.js");
const stats = require("./src/stats.js");
const core = require("@actions/core");

/**
 * @returns void
 */
async function run() {
  try {
    const action_stats = await stats.run();
    const action_renewable = await renewable.run();
    comment.run(action_stats, action_renewable);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
