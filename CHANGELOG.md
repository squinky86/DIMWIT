# Changelog

## 0.0.5 — 2026-11-10

- Added inert HTML/code-comment, metadata/attribute, hidden/template/noscript, Markdown link/image/reference, and active-source demonstrations with explicit trust boundaries.
- Added bounded source inspection with quote-aware tag scanning, exact attribute/comment/container spans, independent lexical instruction evidence, and selected hiding/resource/active-content indicators.
- Added benign, malformed, nested-looking, delimiter-bearing and encoded-source fixtures. Markup is never rendered and destinations are never resolved or fetched.
- Documented parser subsets and the limits of source versus rendered copy/paste and external visibility.

## 0.0.4 — 2026-11-10

- Added strict UTF-8 Base64/Base64URL, hex, percent, character-reference and Unicode-escape demonstrations and inspection.
- Added bounded recursive inspection across decoded layers with transformation paths, separate original/decoded offsets, and explicit incomplete status at shared budgets.
- Added spacing, casing, leetspeak and typoglycemia illustrations with heuristic labels and no semantic-recovery claim.
- Added standard vectors, Unicode/BOM round trips, invalid padding/UTF-8/escape cases, benign data, nested source attribution, and decoding-limit tests.

## 0.0.3 — 2026-11-10

- Added UTF-8 variation-selector payloads, limited Cyrillic confusable substitution, and balanced directional-control demonstrations.
- Updated the pinned character and standardized/emoji variation data to Unicode 18.0.0. Added unusual whitespace, combining-mark runs, Greek/Cyrillic comparisons, mixed-script tokens, and NFC/NFD/NFKC/NFKD evidence.
- Added bounded bidi pairing with isolate boundaries, paragraph resets, and unpaired-control evidence. Previews stay isolated and original text is preserved.
- Added whitespace and comparison views, changed-code-point previews, and benign multilingual, emoji, normalization, malformed, nested-bidi, and size-limit fixtures.

## 0.0.2 — 2026-11-10

- Added instruction override, system-role impersonation, code-fence/delimiter breakout, and dummy prompt-extraction demonstrations.
- Inspector recognizes documented literal recipe structures and shows independent lexical or structural heuristic matches with exact spans and rule names.
- Technique-specific field labels, explanations, reset examples, and shared inert previews. Quoted instructions and ordinary documentation remain possible matches, without any privilege, intent, or model-behavior claim.
- Added benign multilingual, malformed framing, offset, mixed-evidence, and bounded-repetition regression fixtures.

## 0.0.1 — 2026-11-10

- Jekyll and Alpine.js application with separate Demonstrate and automatic Inspect workflows.
- Printable ASCII to Unicode tag demonstration; hidden Unicode and formatting inspection with exact offsets and escaped context.
- Recovery of readable tag text, benign emoji context, explicit partial scans, and bounded output.
- Accessible responsive interface, original SVG branding, clipboard fallback, and generated documentation.
- Compact two-column workspace with Demonstrate selected by default, automatic updates after a fixed 0.6-second pause, switchable output views, and expandable evidence details.
- Locked dependencies, weekly update issues for manual resolution, and tested GitHub Pages deployment using ubuntu-26.04.
- Current stable Action release references, Node 26 LTS, Ruby 4.0, and Bundler 4.0.24; documented Jekyll constraints for deferred gem major upgrades.

First alpha release. Keyboard navigation and speech output were verified with Orca and Chromium, including editable field labels, preview updates, revealed text, source selection, and expandable explanations. Chromium and Firefox regression, mobile viewport, clipboard, and automated accessibility checks pass. Safari, physical devices, and human listening studies are not part of this verification.

Development proceeds directly on `main` during alpha and beta. Backward compatibility is never required. Dependency automation reports available updates as issues for manual resolution; automatic update PRs and code changes are disabled.
