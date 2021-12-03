<h1 align="center">🌱 CO2 🔥</h1>
<h4 align="center">Get notified about your website's carbon emissions using GitHub Actions</h4>
<p align="center">
  <br />
    <a href="https://github.com/GeopJr/CO2/blob/main/CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Contributor%20Covenant-v2.1-86d72a.svg?style=for-the-badge&labelColor=6c4331" alt="Code Of Conduct" /></a>
    <a href="https://github.com/GeopJr/CO2/blob/main/LICENSE"><img src="https://img.shields.io/badge/LICENSE-BSD--2--Clause-86d72a.svg?style=for-the-badge&labelColor=6c4331" alt="BSD-2-Clause" /></a>
</p>

#

## How does CO2 (the action) work?

CO2 (the action) will calculate your website's carbon emissions based on the amount of data it transfers to the client, as well as notify you if your host is using renewable or bog standard energy, along with how much CO2 you could not emit by switching to one that uses renewable energy (if not on one already).
Some fun (or not so fun) facts about it in the long run will also be included!

To stay on par with [Website Carbon Calculator](https://websitecarbon.com/) without spamming their API, the same functions happen locally.
This includes their [calculations](https://gitlab.com/wholegrain/carbon-api-2-0) as well as their way of getting the amount transferred data (lighthouse).

The renewable energy data is provided by the [The Green Web Foundation](https://www.thegreenwebfoundation.org/), however since it relies on an external API, it is disabled by default.

Lastly, the action will:

- print the results on the action log
- comment on the commit that caused the push event to be emitted
- comment on the PR that caused a pull_request event to be emitted

The action uses a prebuilt Docker image based on node:lts-slim with chromium and pnpm. You can find it on [Dockerfile.base](./Dockerfile.base). During building, [Dockerfile.base.dockerignore](./Dockerfile.base.dockerignore) replaces [.dockerignore](./.dockerignore).

#

## Installation

A basic workflow would be:

```yaml
# .github/workflows/CO2.yaml
name: Calculate CO2 🌱
# You can remove any you don't want
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Calculate CO2 🌱
        uses: GeopJr/CO2@v1
        with:
          url: "https://geopjr.dev/"
          renewable: true
```

### Input

| Key         |       Default       | Required | Description                                                                    |
| ----------- | :-----------------: | :------: | ------------------------------------------------------------------------------ |
| `url`       |          -          |    ✅    | The url to check (please include the protocol eg. `https://`)                  |
| `comment`   |       `true`        |    ❌    | Whether to create commit & PR comments                                         |
| `token`     | `${{github.token}}` |    ❌    | Token used for creating comments                                               |
| `renewable` |       `false`       |    ❌    | Whether to check if the website uses renewable energy (calls external service) |
| `nerds`     |       `true`        |    ❌    | Whether to include 'Stats for nerds' (comment only)                            |
| `footer`    |       `true`        |    ❌    | Whether to include the footer (comment only)                                   |

#

## Combinations

You can combine actions and create cases for more control, here's some:

<details><summary>Conditional based on event</summary>

```yaml
# .github/workflows/CO2.yaml
name: Calculate CO2 🌱

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Calculate CO2 🌱 on push
        if: github.event_name == 'push'
        uses: GeopJr/CO2@v1
        with:
          url: "https://gnome.org/"
          renewable: true

      - name: Calculate CO2 🌱 on PR
        if: github.event_name == 'pull_request'
        uses: GeopJr/CO2@v1
        with:
          url: "https://kde.org/"
          renewable: true
```

</details>

<details><summary>After Netlify finishes a preview</summary>

This uses an external actions, please read the following before using:

- https://github.com/JakePartusch/wait-for-netlify-action

```yaml
# .github/workflows/CO2.yaml
name: Calculate CO2 🌱

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Waiting for Netlify to finish the preview
        uses: jakepartusch/wait-for-netlify-action@v1.3
        id: netlify
        with:
          site_name: "replaceme"
          max_timeout: 60
      - name: Calculate CO2 🌱
        uses: GeopJr/CO2@v1
        with:
          url: "${{ steps.netlify.outputs.url }}"
          renewable: true
```

</details>

<details><summary>After Vercel finishes a preview</summary>

This uses an external actions, please read the following before using:

- https://github.com/zentered/vercel-preview-url
- https://github.com/UnlyEd/github-action-await-vercel

```yaml
# .github/workflows/CO2.yaml
name: Calculate CO2 🌱

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - run: sleep 60
      - name: Waiting for Vercel to finish the preview
        uses: zentered/vercel-preview-url@v1.0.0
        id: vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        with:
          vercel_team_id: "replaceme"
          vercel_project_id: "replaceme.com"
      - name: Calculate CO2 🌱
        uses: GeopJr/CO2@v1
        with:
          url: "https://${{ steps.vercel.outputs.preview_url }}"
          renewable: true
```

</details>

<details><summary>Additional conditions</summary>

```yaml
# Only run on commits that have "[CO2]" in their title
if: "contains(github.event.head_commit.message, '[CO2]')"
# Only run on commits that don't have "[skip-CO2]" in their title
if: "!contains(github.event.head_commit.message, '[skip-CO2]')"
# Check if it's a PR from the same repo (not a fork)
if: github.event.pull_request.head.repo.full_name == github.repository
# Run only when a file in a certain folder changes
on:
  push: # pull_request also works
    paths:
      - 'website/'
```

</details>

#

## Screenshots

<details><summary>Commit comment</summary>

<img src="https://i.imgur.com/0RGQEQ9.png" alt="commit comment with the result of CO2" width="768px" />

</details>

<details><summary>PR review</summary>

<img src="https://i.imgur.com/HiI2yCv.png" alt="pull request comment/review with the result of CO2" width="768px" />

</details>

<details><summary>Action log</summary>

<img src="https://i.imgur.com/82BdVP6.png" alt="action log with the result of CO2" />

</details>

#

## Credits

This whole action is heavily inspired by the [Website Carbon Calculator](https://www.websitecarbon.com/) by [Wholegrain Digital](https://www.wholegraindigital.com/).

The renewable energy check is being done by [The Green Web Foundation](https://www.thegreenwebfoundation.org/).

Both of them support a great cause so consider supporting them:

- https://www.wholegraindigital.com/#services
- https://nlnet.nl/donating/ (I'm not sure how to donate to The Green Web Foundation, but this it the closest I could find)

Take action: [Switch to a green host](https://www.wholegraindigital.com/blog/choose-a-green-web-host/) | [Make your website more efficient](https://www.wholegraindigital.com/blog/website-energy-efficiency/) | [Plant trees to reduce your carbon impact](https://treesforlife.org.uk/support/for-businesses/carbon-offsetting/)

#

## Contributing

1. Read the [Code of Conduct](https://github.com/GeopJr/CO2/blob/main/CODE_OF_CONDUCT.md)
2. Fork it ( https://github.com/GeopJr/CO2/fork )
3. Create your feature branch (git checkout -b my-new-feature)
4. Commit your changes (git commit -am 'Add some feature')
5. Push to the branch (git push origin my-new-feature)
6. Create a new Pull Request
