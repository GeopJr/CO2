// This file is responsible for creating the comments & the action log
// as well as do the calculations for the fun facts

const core = require("@actions/core");
const github = require("@actions/github");

/**
 * @param {number} a
 * @param {number} b
 * @returns {string}
 */
const percentageDifference = (a, b) => {
  return (100 * Math.abs((a - b) / ((a + b) / 2))).toFixed() + "%";
};

exports.run = (action_stats, action_renewable) => {
  const stats = JSON.parse(action_stats);
  const renewable = action_renewable ?? false;
  const renewableEnabled = core.getBooleanInput("renewable") ?? false;
  const energyType = renewable ? "renewable" : "grid";
  const grams = stats.co2[energyType].grams;
  const per10kyear = grams * 10000 * 12;
  const kilos = per10kyear / 1000;
  const evil = grams >= 1;
  const facts = {
    perView: grams.toFixed(2),
    kilos: kilos.toFixed(2),
    trees: (kilos / 21).toFixed(), // apparently 21 kg co2/tree/year
    energy: (stats.energy * 10000 * 12).toFixed(),
    savings: percentageDifference(
      stats.co2.grid.grams,
      stats.co2.renewable.grams
    ),
  };

  // Strings for the comments
  const website = core.getInput("url", { required: true });
  const title = `${evil ? "🔥🚒💥🧯" : "🌳🌱♻️💚"} CO2 Results Are In!`;
  const co2grams = `\`${website}\` produces **${
    facts.perView
  }g of CO2** every time someone visits it! ${evil ? "🔥" : "🌱"}`;
  const energy = !renewableEnabled
    ? null
    : `\`${website}\` runs on ${
        renewable ? "**sustainable energy**" : "**bog standard energy**"
      }. ${!renewable ? "🧯" : "♻️"}`;

  const yearTitle = `In a year (**~10k views per month**), \`${website}\` produces:`;
  const yearKg = `**${facts.kilos}kg** of CO2 ${evil ? "🏋️" : "🪶"}`;
  const yearTrees = `The amount of CO2 that **${facts.trees}** tree${
    facts.trees === "1" ? "" : "s"
  } absorb${facts.trees !== "1" ? "" : "s"} in a year ${evil ? "🪓" : "🌳"}`;
  const yearEnergy = `**${facts.energy}kWh** of energy ${evil ? "🚘" : "🚲"}`;
  const stats4NerdsTitle = `Stats for nerds 🤓`;
  const stats4Nerds = `${JSON.stringify(stats, null, 2)}`;
  const poweredBy = `Powered by: [Website Carbon](https://www.websitecarbon.com/) | [Wholegrain Digital](https://www.wholegraindigital.com/) | [The Green Web Foundation](https://www.thegreenwebfoundation.org)`;
  const takeAction = `Take action: [Switch to a green host](https://www.wholegraindigital.com/blog/choose-a-green-web-host/) | [Make your website more efficient](https://www.wholegraindigital.com/blog/website-energy-efficiency/) | [Plant trees to reduce your carbon impact](https://treesforlife.org.uk/support/for-businesses/carbon-offsetting/)`;
  const lessCO2 =
    facts.savings !== "0%" && renewableEnabled && !renewable
      ? `*(If \`${website}\` used green hosting, it would use ${facts.savings} less CO2)* 📉`
      : null;

  // Action log
  core.info("----------");
  core.info(title);
  core.info("----------");
  core.info(co2grams);
  if (energy) core.info(energy);
  if (lessCO2) core.info(lessCO2);
  core.info("----------");
  core.info(yearTitle);
  core.info(yearKg);
  core.info(yearTrees);
  core.info(yearEnergy);
  core.info("----------");
  core.info(stats4NerdsTitle);
  core.info(stats4Nerds);
  core.info("----------");
  core.info(poweredBy);
  core.info(takeAction);
  core.info("----------");

  // If PR and comments are enabled
  const pr = github.context?.payload?.pull_request;
  const commit = github.context.eventName === "push";
  if ((!pr && !commit) || !core.getBooleanInput("comment")) {
    process.exit(0);
  }

  const body = `
# ${title}

${co2grams}
${energy ?? ""}
${lessCO2 ?? ""}

---

${yearTitle}

- ${yearKg}
- ${yearTrees}
- ${yearEnergy}
${
  core.getBooleanInput("nerds")
    ? `
---

<details><summary>Stats for nerds 🤓</summary>
<p>

\`\`\`json
${JSON.stringify(stats, null, 2)}
\`\`\`

</p>
</details>`
    : ""
}
${
  core.getBooleanInput("footer")
    ? `
---
${
  !renewableEnabled
    ? ``
    : `\n![This website is hosted ${
        renewable ? "Green" : "Grey"
      } - checked by thegreenwebfoundation.org](https://api.thegreenwebfoundation.org/greencheckimage/${encodeURIComponent(
        new URL(website).host
      )})`
}

${poweredBy}

${takeAction}`
    : ""
}
`.replace("\n\n\n", "\n\n");

  // Create the comment
  const token = core.getInput("token");
  const octokit = github.getOctokit(token);

  const octokitBody = {
    owner: github.context.payload.repository.owner.login,
    repo: github.context.payload.repository.name,
    body: body,
  };

  if (pr) {
    octokitBody.pull_number = pr.number;
    octokitBody.event = "COMMENT";
    octokit.rest.pulls.createReview(octokitBody);
  } else {
    octokitBody.commit_sha = github.context.sha;
    octokit.rest.repos.createCommitComment(octokitBody);
  }
};
