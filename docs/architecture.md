![DIMWIT logo](../assets/images/dimwit-logo.svg)

# DIMWIT application architecture

DIMWIT is a static Jekyll application with Alpine.js interactions. It has two related browser-only workflows: Demonstrate creates safe examples of injection techniques, while Inspect analyzes arbitrary pasted text for supported evidence. GitHub holds the source, milestones, issues, releases, and deployment workflow.

## Application and documentation

The project URL is `https://squinky86.github.io/DIMWIT/`. Its root serves the application. Jekyll generates documentation at `/DIMWIT/docs/` with reciprocal navigation, shared layouts, and the same SVG logo and compact icon as the README. All assets and links respect the `/DIMWIT` base path. Jekyll provides the [layouts, includes, and static asset structure](https://jekyllrb.com/docs/structure/).

Demonstrate contains the technique selector. Each technique declares the fields and options its example needs; some accept cover text and an inserted instruction, while others transform selected text directly. The interface shows rendered, raw, and escaped output and offers a copy action.

Inspect has no technique selector. A single paste and explicit inspection action runs all enabled analyzers, so users do not need to know how suspicious text was constructed. Findings remain independent when several signals occur in one input.

## Technique and analyzer modules

Pure JavaScript modules implement demonstrations and analyzers independently of Alpine and the DOM. A module declares a stable internal ID, label, technique family, required demonstration fields, capabilities, evidence types, limits, and optional demonstration and analysis functions. Internal IDs support tests and documentation; they are not claims about which external tool created pasted text.

Every finding includes a source span, observed evidence, explanatory text, and decoded or transformed content only when the operation is unambiguous. Future nested decoding will record the transformation path and distinguish original-input spans from decoded-content spans. Evidence must distinguish JavaScript string offsets, Unicode code points, and user-perceived grapheme clusters.

The 0.0.1 implementation uses `tags.js` for the Unicode-tag demonstration, `inspector.js` for automatic analyzer dispatch, and `text.js` plus a pinned Unicode 17 data file for evidence and limits. Descriptors declare stable IDs, fields, capabilities, evidence types, and budgets. Source ranges are end-exclusive UTF-16 offsets; separate code-point ranges are explicitly not grapheme positions. Nested decoding and grapheme visualization remain future work, not MVP capabilities.

Analyzers return findings plus completion status. Size or depth limits, unsupported syntax, and analyzer failures produce an incomplete result rather than a clean result. No numeric confidence score is shown without a labeled and calibrated evaluation corpus.

## Result language

The interface reports observations rather than a binary injected or clean verdict. Supported outcomes include hidden or encoded content, injection-like instructions, non-rendered markup instructions or active-content indicators, and malformed or suspicious structural evidence. “No supported indicators found” means only that all enabled analyzers completed without producing a finding.

A phrase such as “ignore previous instructions” can be an attack, a quotation, documentation, or a benign test. Similarly, hidden Unicode proves that hidden characters are present, not why they were inserted. The interface keeps that distinction beside each finding.

## Rendering and data handling

Prompts, outputs, decoded content, and findings stay in browser memory. DIMWIT does not send them to a server, put them in URLs, log them, persist them, or submit them to a model. Loading the site and its static assets still makes ordinary hosting requests.

Render all user-controlled and decoded content as text. Never render pasted HTML or Markdown, resolve pasted links, load external resources, or execute decoded instructions. Directionality controls are isolated from surrounding labels. The application sets explicit input, output, recursion, and decoded-size limits; preserves the original after errors; and provides selectable text when clipboard access fails.

## Technique families

The alpha releases add these families:

- Non-printing text, including the prototype-inspired initial demonstration.
- Direct and structural injection, including instruction overrides, role impersonation, delimiter breakouts, and extraction requests.
- Unicode deception, including tag characters, variation selectors, zero-width characters, confusables, bidirectional controls, unusual whitespace, and normalization differences.
- Encoded and obfuscated text, including standard encodings, escaped representations, and explicitly labeled heuristic evasion examples.
- Indirect and markup injection in pasted HTML, Markdown, and source-like text.
- Context scenarios for retrieved content, tool results, memory, and dummy-data exfiltration.

OWASP distinguishes direct and indirect prompt injection and documents encoding, Unicode smuggling, typoglycemia, HTML and Markdown, multi-turn, and agent-specific attack families in its [prompt-injection guidance](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html). Unicode describes the security impact of invisible characters and specifically identifies variation-selector and tag-character sequences as cross-prompt-injection vectors in [Chapter 5 of the Unicode Standard](https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-5/).

## Dependencies and delivery

Manage Jekyll with Bundler and a committed lockfile. Manage Alpine with npm and a committed lockfile, copying its distribution into the generated site during the build. Node supplies build scripts and its built-in test runner; no bundler or additional runtime framework is planned. Alpine supports [script-based installation](https://alpinejs.dev/essentials/installation); serving a locked local artifact makes dependency updates reproducible.

Configure weekly [Dependabot updates](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference) for Bundler, npm, and GitHub Actions, with update pull requests assigned to `squinky86`. Verify security alerts and updates separately. Personal notification settings control email delivery, so documentation describes that owner-controlled step.

Pull requests install locked dependencies, run JavaScript tests, and build the site. The default branch deploys only a tested artifact through [GitHub Pages Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), using limited deployment permissions and the `github-pages` environment. Checks cover the application, documentation, navigation, and assets under the `/DIMWIT` project path.

Both build and deploy use `ubuntu-26.04`. Prefer that runner for future jobs when it supports the required tooling. The application version comes from `package.json`; build preparation generates the shared version label for application and docs.

## Licensing and compatibility

Project code, documentation, and original artwork use AGPL-3.0-only. Dependency notices remain intact, and the deployed application links to its corresponding source. The full license is in [LICENSE](../LICENSE).

The project follows [Semantic Versioning](https://semver.org/) with an explicit development-stage convention: `0.0.x` releases are alpha, `0.y.x` releases with `y >= 1` are beta, and `1.0.0` defines the stable public contract. Alpha and beta releases are GitHub prereleases with immutable version tags. Technique data formats may use independent internal versions when compatibility requires them, without turning format identification into a user-facing attribution feature.

## Technical references

- Default-ignorable, whitespace, and hidden-character presentation: [Unicode UTS 55](https://www.unicode.org/reports/tr55/).
- Confusable mappings and mixed-script evidence: [Unicode UTS 39](https://www.unicode.org/reports/tr39/).
- Directional controls and logical ordering: [Unicode UAX 9](https://www.unicode.org/reports/tr9/).
- Unicode normalization forms: [Unicode UAX 15](https://www.unicode.org/reports/tr15/).
- Base encodings and test vectors: [RFC 4648](https://www.rfc-editor.org/rfc/rfc4648).
- URL percent encoding: [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986).
- JSON string escapes: [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259).
- HTML comments, attributes, and character references: [HTML Standard](https://html.spec.whatwg.org/multipage/).
