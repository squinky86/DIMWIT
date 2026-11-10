---
title: Development and releases
permalink: /docs/development/
---
# Build and contribute

The application is Jekyll plus Alpine.js, with no backend or model integration. Pure JavaScript modules handle transformations and inspection; Alpine handles the interface. The only direct npm runtime dependency is Alpine. The browser uses a local Alpine file copied from the locked npm package during the build.

## Local setup

Use Node 24 and Ruby 3.3.13, as selected in `.node-version` and `.ruby-version`. Install Bundler 2.5.22, a compiler, Ruby development headers, and OpenSSL development libraries where your platform requires them.

```sh
gem install bundler -v 2.5.22
bundle config set --local path vendor/bundle
bundle install
npm ci
npm test
npm run build
npm run dev
```

Open `http://127.0.0.1:4000/DIMWIT/`. On distributions that name the Bundler executable `bundle3.3`, use that command for the two Bundler setup commands; the npm scripts detect either executable. The production build uses `/DIMWIT` as its base path, matching GitHub Pages.

`npm run build` copies Alpine and its license, generates display-version data from `package.json`, builds with Jekyll, and checks internal links, assets, version labels, and build exclusions. `npm test` uses Node’s built-in test runner; there is no application test-framework dependency. The version is `0.0.1`, labeled **alpha preview** until release acceptance.

## Code map

| Path | Responsibility |
| --- | --- |
| `assets/js/tags.js` | Printable ASCII transformation and bounded tag decoding |
| `assets/js/inspector.js` | Automatic analyzer dispatch, findings, completion status |
| `assets/js/text.js` | Character classification, escaping, positions, limits |
| `assets/js/unicode-data.js` | Generated and pinned Unicode names and coverage |
| `assets/js/app.js` | Alpine component, fields, view state, clipboard fallback |
| `index.html` and `assets/css/site.css` | Application markup and visual presentation |
| `_layouts` and `docs` | Generated documentation and shared navigation |
| `tests/analysis.test.mjs` | Round trips, Unicode fixtures, limits, failures, offsets |

To add a technique, define pure functions and relevant demonstration fields, add its supported analyzer to the registry, and provide positive, benign, malformed, and budget fixtures. Inspect must remain independent of the selected demonstration. Never pass pasted or decoded text into HTML or JavaScript execution sinks.

## GitHub Actions and dependencies

The workflow uses **ubuntu-26.04** for both build and deploy. Prefer that runner for future jobs unless compatibility requires another. Pull requests install locked dependencies, test, build, verify project-path links, and upload a Pages artifact. They cannot deploy. Only a tested `main` build deploys, with a separate job and limited Pages/OIDC permissions.

Actions are pinned to commit SHAs and covered by Dependabot. Weekly updates cover Bundler, npm, and Actions, with update pull requests assigned to `squinky86`. Repository vulnerability alerts and automatic security fixes were enabled and verified on November 10, 2026. Verify dependency-graph ingestion and the first available Dependabot check after merge. Personal notification settings control web and email delivery; assignment alone does not guarantee email. Dependabot configuration starts operating after it reaches the default branch.

## Review and release

The [review checklist]({{ '/docs/review/' | relative_url }}) records verification and remaining release gates. Issues and milestone status remain open until their acceptance criteria are satisfied. Review the implementation pull request before merging it into `main`.

After acceptance and a successful Pages deployment, remove the preview stage label in `scripts/prepare-site.mjs`, confirm the changelog and application version, create immutable tag `v0.0.1` at the accepted commit, and publish a GitHub prerelease with its Pages link, coverage, and known limits. A tag does not deploy by itself; the tested main-branch workflow does. The release issue tracks these actions so a review build is not mistaken for a released alpha.

Versions `0.0.x` are alpha and `0.y.x` with `y >= 1` are beta. Publish new versions for changes to an existing release. Never rewrite released tags.

If deployment fails, inspect the build/link check and the Pages job separately. Verify the `github-pages` environment and Actions publishing source. To roll back, revert the faulty change on `main` through a reviewed commit and let the same tested workflow redeploy; preserve the historical tag and note the rollback in the next release.
