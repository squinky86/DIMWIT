---
title: Alpha verification
permalink: /docs/review/
---
# Alpha verification

The 0.0.1–0.0.6 alpha sequence is implemented directly on `main`, with immutable prereleases and successful Pages deployments linked in the [release record]({{ '/docs/releases/' | relative_url }}). The owner's instruction to complete the alpha milestones authorizes release acceptance. The 0.1.0 beta remains open for its separate acceptance and release.

## Reproduce the workflows

1. Open [the toolkit]({{ '/' | relative_url }}). Demonstrate opens with a ready-made Unicode-tag example. Select another technique and use Reset example to load its fixture.
2. Edit a field and pause for 0.6 seconds. Compare Rendered, Raw and Escaped, and copy the complete output from any view. Update timing is documented here rather than displayed as a main-site note.
3. Inspect the output. All supported analyzers run independently of the demonstration selection. Expand evidence, paths, comparisons and offsets; source selection must match the original ancestor. Nested decoded ranges are labeled separately.
4. Compare ordinary text with benign formatting, multilingual, encoded and markup data. Observations are not a safety verdict. Try malformed input, an oversized block, or excessive nesting: inspection must be explicitly incomplete and preserve the original text.
5. Open Scenarios. Select an injected and benign comparison, examine trust boundaries, then load the exact source into Demonstrate and Inspect. Reset the scenario and verify that a previously loaded inspection remains intact.
6. Use only the keyboard for editing, changing views, copying or selecting text, and navigating evidence. Test mobile widths, composition, clipboard denial, and generated documentation.

## Automated and browser evidence

The final alpha has **81 unit and interaction tests** across eight files. Coverage includes literal tag and standard encoding vectors, Unicode/BOM round trips, benign multilingual and emoji contexts, confusable/normalization comparisons, nested bidi pairing, source spans, malformed and unsupported syntax, recursion/input/output/candidate limits, independent mixed findings, analyzer failures, inert text, scenario fidelity, debounce/composition/reset behavior, clipboard races, and dependency-report policy. Unsupported codec names and user-controlled attribute names cannot inject directional controls into interface labels.

`tests/browser.mjs` verifies **20 techniques and ten scenarios with both comparisons** in Chromium 157 and Firefox 159. Checks include output fidelity, source selection, all preview views, keyboard focus, actual clipboard preservation in Chromium, denied-clipboard selection in both browsers, oversized input, explicit script/image inertness, 320/390/768px layouts across all three workflows, and all generated documentation routes. No external content requests or page script errors were observed.

Axe WCAG 2 A/AA and 2.1 A/AA checks pass for technique previews, inspection findings, incomplete inspection, the scenario workspace, and documentation in both browsers. Screenshots were visually reviewed at 1366×768 and mobile width; the default desktop workspace fits without page scrolling. Browser tooling is installed separately from application dependencies; reproduction instructions are in [Development]({{ '/docs/development/' | relative_url }}).

The production Jekyll build verifies **eight generated pages**, project-path links, assets, shared version labels and exclusion of source-only files. Every release follows a successful `main` build and Pages deployment. Historical workflow URLs are in the release record; the final release issue links its accepted commit and workflow.

## Screen-reader evidence and limits

Orca with Chromium was exercised in an isolated desktop session. Keyboard flows cover editing, automatic preview, transfer to Inspect, recovered text, source-selection controls, and explanations. Speech output confirmed the field labels, preview update, inspection region, decoded BANANA text, selection range and explanation control. The final scenario flow also exercises scenario selection, the benign comparison, and inspection, with AT-SPI events and speech output recorded.

This is actual screen-reader integration testing using recorded speech output, not a human listening study. Safari and physical devices remain untested. Automated accessibility and viewport checks do not establish those forms of coverage.

## Release policy and coverage

Each release confirms application/docs version consistency, tests and production build, live deployment, changelog, immutable tag and GitHub prerelease before closing its milestone. Dependency automation continues to report issues for manual resolution, without PRs or code/lockfile changes; security alerts remain separate. Versions `0.0.x` are alpha and `0.y.x` with `y >= 1` are beta. No backward compatibility is required, and tags are never rewritten.

The supplied prototype directory was checked and contains no files. Alpha proceeds with the independently documented mapping under the owner's instruction, without a prototype-comparison or compatibility claim. See [techniques and coverage]({{ '/docs/format/' | relative_url }}) for exact parser subsets, Unicode data, decoding budgets, external trust assumptions and known gaps.
