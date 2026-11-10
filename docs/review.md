---
title: MVP review checklist
permalink: /docs/review/
---
# Review the 0.0.1 MVP

This build is an alpha preview for review in [PR #19](https://github.com/squinky86/DIMWIT/pull/19). Release tagging and production acceptance are tracked separately in [issue #10](https://github.com/squinky86/DIMWIT/issues/10).

## Try the application

1. Open [the toolkit]({{ '/' | relative_url }}). Inspect is usable immediately, without selecting a demonstration technique.
2. Load **Hidden instruction**, inspect it, and read the revealed content. Select its source span and expand escaped context.
3. Load **Ordinary text**, then **Emoji & formatting**. Compare no findings with legitimate formatting evidence.
4. Switch to Demonstrate, change the hidden text, generate it, and compare the rendered, raw, and escaped output. Inspect the result directly and through copy/paste.
5. Try empty cover text, unsupported hidden text such as emoji, repeated injection, and a partial tag sequence. Input must remain available after errors.
6. Navigate by keyboard, try a narrow viewport, and visit the generated docs, source, and license links.

## Verification record

Core automated tests cover 24 cases: literal vectors, all printable ASCII, exact cover preservation, Unicode offsets and display boundaries, repeated marks, benign multilingual and emoji input, malformed and reserved tags, output and inspection limits, partial scanning, analyzer failures, and inert decoded strings.

The production build checks generated links and assets under `/DIMWIT/`, version labels, and exclusion of source-only files. Chromium 157 and Firefox 159 browser checks on November 10, 2026 passed the main workflows, exact text selection, stale-result clearing, inert decoded markup, clipboard denial and manual-copy fallback, input limits, 320/390-pixel layouts, keyboard-only inspection, and all generated documentation routes. Chromium also passed an actual clipboard write/read round trip with hidden characters preserved. No external requests or browser script errors were observed in those flows.

Automated axe checks reported no WCAG 2 A/AA or WCAG 2.1 A/AA violations in the empty inspector, findings, generated output, four documentation pages, and 404 page in both browsers. These browser tools were installed in a temporary verification environment, not added as application dependencies. The implementation pull request records CI results.

Safari, physical devices, and screen-reader use have not been tested. Browser viewport checks and automated accessibility checks do not replace those manual checks.

## Release gates

- Review and merge the implementation.
- Verify the default-branch Pages deployment and smoke-test its public URL.
- Verify Dependabot and repository security-update settings on the default branch; check the owner’s preferred notification delivery.
- Publish `v0.0.1` as a GitHub prerelease after acceptance and record its deployment in issue #10.

Prototype comparison remains open because the supplied prototype directory contained no files. The MVP’s independent mapping and scope are documented in [Hidden text & coverage]({{ '/docs/format/' | relative_url }}).
