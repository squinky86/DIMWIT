![DIMWIT logo](../assets/images/dimwit-logo.svg)

# DIMWIT architecture proposal

DIMWIT will be a static Jekyll application with Alpine.js interactions. All prompt transformations and inspection run locally in the browser. GitHub holds the source, milestone plan, issues, releases and deployment workflow.

## Application and documentation

The project URL is `https://squinky86.github.io/DIMWIT/`. Its root serves the application. Jekyll generates documentation at `/DIMWIT/docs/` with reciprocal navigation; shared layouts use the same SVG logo and compact icon as the README. All assets and links must respect the `/DIMWIT` base path. Jekyll provides the [layouts, includes and static asset structure](https://jekyllrb.com/docs/structure/).

The interface has Generate and Inspect flows. Generate accepts cover text, a payload and a method selection. Inspect accepts arbitrary pasted text without requiring the user to know the method. Only implemented methods appear as usable choices. The initial release offers one method, with the same interface supporting later additions.

## Method interface

Pure JavaScript modules implement each method independently of Alpine and the DOM. A small registry supplies a stable method ID, human-readable label, codec version, capabilities, generator and inspector. Findings include source spans, code points, evidence, explanatory text and decoded payloads where recovery is supported. The format specification must define whether offsets count code points or UTF-16 code units and how the UI maps them.

Use four result categories: recognized supported payload, potential indicator, malformed or partial payload, and no supported indicators found. A recognized marker proves that a supported format is present; it does not prove malicious intent or model obedience. Generic non-printing characters and mixed scripts can have legitimate uses. An unflagged prompt may contain unsupported or ordinary-language injection.

Codec versions are independent of application versions. The MVP format task establishes the alphabet, framing, UTF-8 handling, insertion rules, limits and test vectors. Compatibility with the watermark prototype is a conscious design decision after review, rather than an assumed constraint. Do not normalize or remove user text silently. Lossless recovery is supported only where the method specifies it.

## Data handling and rendering

Prompts, outputs and decoded payloads stay in browser memory. The application does not send them to a server, put them in URLs, log them, or persist them. Loading the site and its static assets still makes ordinary hosting requests. No model API, account, database or proxy is needed for alpha.

Render user text as text, including decoded instructions and markup. Escape inspection context and isolate directionality controls from application labels. Set explicit input, output and decoding limits, preserve input on failure, and provide a manual copy fallback. Broader sanitization, remote fetching and automatic model evaluation are outside the initial scope.

## Dependencies and delivery

Manage Jekyll with Bundler and a committed lockfile. Manage Alpine with npm and a committed lockfile, copying its distribution into the generated site during the build. Node supplies build scripts and its built-in test runner; no bundler or additional runtime framework is planned. Alpine supports [script-based installation](https://alpinejs.dev/essentials/installation); serving a locked local artifact makes dependency updates reproducible.

Configure weekly [Dependabot updates](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference) for Bundler, npm and GitHub Actions, with update PRs assigned to `squinky86`. Verify security alerts and updates separately. Personal notification settings control email delivery; document that step rather than claiming it is already configured.

Pull requests install locked dependencies, run JavaScript tests and build the site. The default branch deploys only a tested artifact through [GitHub Pages Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), using limited deployment permissions and the `github-pages` environment. Check app, docs, navigation and asset URLs on the deployed project path. This plan does not install a deployment workflow or publish an application yet.

## Licensing and compatibility

Use AGPL-3.0-only for project code, documentation and original artwork, retain dependency notices, and expose a source link from the deployed application. The full license is in [LICENSE](../LICENSE).

The project follows [Semantic Versioning](https://semver.org/) with an explicit development-stage convention: `0.0.x` alpha, `0.y.x` with `y >= 1` beta, and `1.0.0` the stable public contract. Major-zero APIs may change; disclose changes in release notes. Mark alpha and beta releases as GitHub prereleases, keep released tags immutable, and use one application-version source once implementation starts. Format versions remain independent so older marks can be recognized deliberately.

## Technical references for later methods

- Confusable mappings and their coverage: [Unicode UTS 39](https://www.unicode.org/reports/tr39/).
- Directional controls and logical ordering: [Unicode UAX 9](https://www.unicode.org/reports/tr9/).
- Legitimate variation selectors: [Unicode variation sequence FAQ](https://www.unicode.org/faq/vs.html).
- Base encodings and test vectors: [RFC 4648](https://www.rfc-editor.org/rfc/rfc4648).
- Comment carriers: [HTML comment syntax](https://html.spec.whatwg.org/multipage/syntax.html#comments).
