---
title: Development and releases
permalink: /docs/development/
---
# Build and contribute

The application is Jekyll plus Alpine.js, with no backend or model integration. Pure JavaScript modules handle transformations and inspection; Alpine handles the interface. The only direct npm runtime dependency is Alpine. The browser uses a local Alpine file copied from the locked npm package during the build.

## Local setup

Use Node 26 LTS and Ruby 4.0, as selected in `.node-version` and `.ruby-version`. These identifiers follow stable patch releases within their series. Install Bundler 4.0.24, a compiler, Ruby development headers, and OpenSSL development libraries where your platform requires them.

```sh
gem install bundler -v 4.0.24
bundle config set --local path vendor/bundle
bundle install
npm ci
npm test
npm run build
npm run dev
```

Open `http://127.0.0.1:4000/DIMWIT/`. Ensure `ruby` and `bundle` on your `PATH` belong to the selected Ruby installation. The production build uses `/DIMWIT` as its base path, matching GitHub Pages.

`npm run build` copies Alpine and its license, generates display-version data from `package.json`, builds with Jekyll, and checks internal links, assets, version labels, and build exclusions. `npm test` uses Node’s built-in test runner; there is no application test-framework dependency. The version comes from `package.json` and is labeled **alpha** for `0.0.x` releases.

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

Actions use maintained major release references: `actions/checkout@v7`, `actions/setup-node@v7`, `ruby/setup-ruby@v1`, `actions/upload-pages-artifact@v5`, `actions/configure-pages@v6`, and `actions/deploy-pages@v5`. Prefer stable generic release identifiers over commit hashes. These references receive upstream updates within their series without repository changes. npm and Bundler lockfiles still record exact installed package versions.

Dependabot vulnerability alerts remain enabled, while version-update PRs are disabled with `open-pull-requests-limit: 0` and security-fix PRs are disabled in repository settings. Dependency changes are resolved manually by the maintainer.

The **Report dependency updates** workflow runs Mondays at 14:23 UTC or on manual dispatch, using `ubuntu-26.04`. It reads the npm and Bundler lockfiles (including transitive packages and the Bundler version) and checks upstream stable releases. For Actions, it reports releases outside the configured series, preferring the new major reference when available and falling back to the exact release tag otherwise. Updates already covered by a generic reference need no issue. It creates an issue assigned to `squinky86` when updates are available, or refreshes the managed section of an existing open report while preserving owner notes outside it. Closing a report suppresses duplicates for that exact set of versions; a later version can create a new issue. It never closes an issue automatically, changes code or lockfiles, opens a PR, or commits anything. Its token has only repository-content read and issue write access.

Run `node scripts/check-dependencies.mjs` for a read-only report using Node, Ruby/Bundler, and authenticated GitHub CLI. `--publish` enables issue creation/refresh. Failed upstream lookups fail the check before issue publication instead of producing an incomplete success report. The report describes available versions; the maintainer decides which updates to apply and tests them on `main`. Dependabot vulnerability alerts remain a separate security signal. Personal notification settings control web and email delivery; issue assignment does not guarantee email.

### Current upstream constraints

The [#20 dependency review](https://github.com/squinky86/DIMWIT/issues/20) verified Jekyll 4.4.1 and Alpine 3.17.5 as current stable releases on 2026-11-10. Jekyll's published requirements exclude these newer gem majors:

<div class="table-scroll" role="region" aria-label="Reviewed gem versions and dependency requirements" tabindex="0" markdown="1">

| Gem | Compatible version in the lockfile | Newer version reviewed | Required range |
| --- | --- | --- | --- |
| `json` | 2.21.2 | 3.1.0 | Jekyll: `~> 2.6` |
| `liquid` | 4.0.4 | 5.14.0 | Jekyll: `~> 4.0` |
| `rouge` | 4.7.0 | 5.1.0 | Jekyll: `>= 3.0, < 5.0` |
| `terminal-table` | 3.0.2 | 4.0.0 | Jekyll: `>= 1.8, < 4.0` |
| `unicode-display_width` | 2.6.0 | 3.3.0 | terminal-table: `>= 1.1.1, < 3` |

</div>

Retain these compatible versions until parent releases allow the newer majors. Do not override the [Jekyll gem requirements](https://rubygems.org/gems/jekyll/versions/4.4.1) or [terminal-table requirements](https://rubygems.org/gems/terminal-table/versions/3.0.2). Record such deferrals before closing a dependency report. The report can surface a later upstream version for another manual review.

## Review and release

The [review checklist]({{ '/docs/review/' | relative_url }}) records verification and remaining release gates. Review the application deployed from `main`. Issues and milestone status remain open until their acceptance criteria are satisfied; development does not wait on a pull-request gate.

After acceptance and a successful Pages deployment, confirm the changelog and application version, create the matching immutable version tag at the accepted commit, and publish a GitHub prerelease with its Pages link, coverage, and known limits. A tag does not deploy by itself; the tested main-branch workflow does. The release issue tracks these actions with the accepted commit and deployment evidence.

Versions `0.0.x` are alpha and `0.y.x` with `y >= 1` are beta. Publish new versions for changes to an existing release. Never rewrite released tags.

Backward compatibility is never required, including after alpha and beta. Interfaces, data formats, and behavior may change or be removed. Do not retain old implementations or introduce compatibility layers, migration code, or legacy tests solely to support previous releases. Record breaking changes and apply the project's versioning convention; release numbering does not create an obligation to maintain old behavior.

If deployment fails, inspect the build/link check and the Pages job separately. Verify the `github-pages` environment and Actions publishing source. To roll back, revert the faulty change with a new commit on `main` and let the same tested workflow redeploy; preserve the historical tag and note the rollback in the next release.
