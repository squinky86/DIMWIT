---
title: Alpha verification
permalink: /docs/review/
---
# Alpha verification

The first alpha was accepted for release under the owner's instruction to complete all alpha milestones. Review [the deployed application]({{ '/' | relative_url }}). [Issue #10](https://github.com/squinky86/DIMWIT/issues/10) links the release commit, successful deployment, and immutable prerelease.

## Try the application

1. Open [the toolkit]({{ '/' | relative_url }}). Demonstrate should be selected with a ready-made example and live preview beside the fields.
2. Change the hidden text and pause for 0.6 seconds. Compare Rendered, Raw, and Escaped; copy the original from any view. No Generate button or delay selector is needed.
3. Choose **Inspect output**, or paste into Inspect. Findings should update automatically; source selection and expanded explanations, context, and offsets must match the original input.
4. Load **Ordinary text**, then **Emoji & formatting**. Compare no findings with legitimate formatting evidence.
5. Type rapidly, compose multilingual text, clear/reset during the delay, and try invalid or oversized input. Old results must disappear immediately, and invalid or pending output must not be copyable.
6. Navigate by keyboard without losing focus during automatic updates; test the compact desktop layout, stacked mobile panels, clipboard fallback, and documentation links.

## Verification record

Core automated tests cover 24 cases: literal vectors, all printable ASCII, exact cover preservation, Unicode offsets and display boundaries, repeated marks, benign multilingual and emoji input, malformed and reserved tags, output and inspection limits, partial scanning, analyzer failures, and inert decoded strings.

Twelve dependency-report tests cover issue creation, no-update behavior, duplicate and closed-report suppression, preserving owner notes, handling edited report markers, stable report fingerprints, generic Action references, new-series notifications, exact-tag fallback, and excluding drafts, prereleases, and downgrades.

Twelve interaction tests cover the default demonstration, the fixed 600 ms delay, successive edits, stale-result clearing, composition, reset and example cancellation, independent workflows, exact transfer to inspection, clipboard fallback and late failures, and timer cleanup.

The compact GUI was checked in Chromium 157 and Firefox 159: the default workspace fits at 1366×768 without page scrolling, and both workflows fit 320-, 390-, and 768-pixel widths without horizontal overflow. Browser checks cover automatic updates, input composition, preserved focus, all three output views, exact source selection, actual clipboard preservation in Chromium, denied-clipboard selection in both browsers, malformed and oversized input, and generated docs. Desktop and mobile accessibility checks found no WCAG 2 A/AA or 2.1 A/AA violations in the tested application states.

The production build checks generated links and assets under `/DIMWIT/`, version labels, and exclusion of source-only files. Chromium 157 and Firefox 159 browser checks on November 10, 2026 passed the main workflows, exact text selection, stale-result clearing, inert decoded markup, clipboard denial and manual-copy fallback, input limits, 320/390-pixel layouts, keyboard-only inspection, and all generated documentation routes. Chromium also passed an actual clipboard write/read round trip with hidden characters preserved. No external requests or browser script errors were observed in those flows.

Automated axe checks reported no WCAG 2 A/AA or WCAG 2.1 A/AA violations in the empty inspector, findings, generated output, four documentation pages, and 404 page in both browsers. These browser tools were installed in a temporary verification environment, not added as application dependencies. [GitHub Actions](https://github.com/squinky86/DIMWIT/actions) and the linked milestone issues record CI and deployment results.

On November 10, 2026, a fresh Chromium/Firefox regression passed against the release build. An isolated Orca/Chromium session exercised keyboard-only editing, automatic preview, transfer into Inspect, revealed text, source-selection controls, and expandable explanations. Orca's speech-dispatch log confirmed the field labels, preview update, inspection region, decoded BANANA text, selection range, and explanation control. This is actual screen-reader integration verification with recorded speech output, not a human listening study. Safari and physical devices remain untested; browser viewport checks do not establish device coverage.

## Subsequent alpha verification

`tests/browser.mjs` exercises each available technique and its inspection results in Chromium and Firefox, including WCAG 2/2.1 A/AA axe checks, exact transfer, source selection, keyboard editing, clipboard fidelity/fallback, 320/390/768px layouts, and generated docs. The direct-technique fixtures cover all four recipes, quoted benign matches, multilingual offsets, malformed framing, and bounded repetition. Each release issue records the successful build and deployment.

## Release gates

- Review the application deployed from `main`.
- Verify the default-branch Pages deployment and smoke-test its public URL.
- Verify security alerts, disabled automatic PRs, and the weekly dependency-issue check; check the owner’s preferred notification delivery.
- Publish `v0.0.1` as a GitHub prerelease after acceptance and record its deployment in issue #10.

The supplied prototype directory was checked again and contains no files. The owner's instruction to complete the alpha releases is being carried out using the independently specified mapping; there is no prototype comparison or compatibility claim. See [Hidden text & coverage]({{ '/docs/format/' | relative_url }}).
