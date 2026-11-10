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
| `assets/js/toolkit.js` | Interaction state, 600 ms updates, composition, clipboard fallback |
| `assets/js/app.js` | Alpine component registration and startup |
| `index.html` and `assets/css/site.css` | Application markup and visual presentation |
| `_layouts` and `docs` | Generated documentation and shared navigation |
| `tests/analysis.test.mjs` | Round trips, Unicode fixtures, limits, failures, offsets |
| `tests/toolkit.test.mjs` | Debounce timing, stale results, resets, composition, clipboard races |

To add a technique, define pure functions and relevant demonstration fields, add its supported analyzer to the registry, and provide positive, benign, malformed, and budget fixtures. Inspect must remain independent of the selected demonstration. Never pass pasted or decoded text into HTML or JavaScript execution sinks.

## GitHub Actions and dependencies

Work directly on `main` / HEAD throughout alpha and beta. Run appropriate checks, commit, and push to `main`; do not create development branches or pull requests. Track work in issues and milestones using commit and workflow links. The [repository working rules](https://github.com/squinky86/DIMWIT/blob/main/AGENTS.md) preserve this policy for future contributors and agents.

The workflow uses **ubuntu-26.04** for both build and deploy. Prefer that runner for future jobs when it supports the required tooling. Each `main` push installs locked dependencies, tests, builds, verifies project-path links, and uploads a Pages artifact. A separate job deploys only that tested artifact with limited Pages/OIDC permissions. Manual workflow dispatch also requires `main`.

Actions are pinned to commit SHAs. Dependabot vulnerability alerts remain enabled, while version-update PRs are disabled with `open-pull-requests-limit: 0` and security-fix PRs are disabled in repository settings. Dependency changes are resolved manually by the maintainer.

The **Report dependency updates** workflow runs Mondays at 14:23 UTC or on manual dispatch, using `ubuntu-26.04`. It reads the npm and Bundler lockfiles (including transitive packages), checks upstream versions, and checks Action tracking refs plus latest releases. It creates an issue assigned to `squinky86` when updates are available, or refreshes the managed section of an existing open report while preserving owner notes outside it. Closing a report suppresses duplicates for that exact set of versions; a later version can create a new issue. It never closes an issue automatically, changes code or lockfiles, opens a PR, or commits anything. Its token has only repository-content read and issue write access.

Run `node scripts/check-dependencies.mjs` for a read-only report using Node, Ruby/Bundler, and authenticated GitHub CLI. `--publish` enables issue creation/refresh. Failed upstream lookups fail the check before issue publication instead of producing an incomplete success report. The report describes available versions; the maintainer decides which updates to apply and tests them on `main`. Dependabot vulnerability alerts remain a separate security signal. Personal notification settings control web and email delivery; issue assignment does not guarantee email.

## Review and release

The [review checklist]({{ '/docs/review/' | relative_url }}) records verification and remaining release gates. Review the application deployed from `main`. Issues and milestone status remain open until their acceptance criteria are satisfied; development does not wait on a pull-request gate.

After acceptance and a successful Pages deployment, remove the preview stage label in `scripts/prepare-site.mjs`, confirm the changelog and application version, create immutable tag `v0.0.1` at the accepted commit, and publish a GitHub prerelease with its Pages link, coverage, and known limits. A tag does not deploy by itself; the tested main-branch workflow does. The release issue tracks these actions so a review build is not mistaken for a released alpha.

Versions `0.0.x` are alpha and `0.y.x` with `y >= 1` are beta. Publish new versions for changes to an existing release. Never rewrite released tags.

Backward compatibility is never required, including after alpha and beta. Interfaces, data formats, and behavior may change or be removed. Do not retain old implementations or introduce compatibility layers, migration code, or legacy tests solely to support previous releases. Record breaking changes and apply the project's versioning convention; release numbering does not create an obligation to maintain old behavior.

If deployment fails, inspect the build/link check and the Pages job separately. Verify the `github-pages` environment and Actions publishing source. To roll back, revert the faulty change with a new commit on `main` and let the same tested workflow redeploy; preserve the historical tag and note the rollback in the next release.
