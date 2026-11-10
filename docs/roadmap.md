![DIMWIT logo](../assets/images/dimwit-logo.svg)

# DIMWIT release roadmap

The first alpha delivers non-printing text generation and inspection in a Jekyll and Alpine.js application. Later alpha releases add one carrier or transformation family at a time, each with matching inspection, fixtures and documentation. The milestones are ready for review; implementation and release dates have not been committed.

## Milestone sequence

| Milestone | User-visible outcome | Exit gate |
| --- | --- | --- |
| [0.0.1](https://github.com/squinky86/DIMWIT/milestone/1) | Select the non-printing method, generate text, copy it, and inspect pasted text for supported payloads and possible indicators. | All ten MVP issues accepted, app and docs deployed, v0.0.1 released. |
| [0.0.2](https://github.com/squinky86/DIMWIT/milestone/2) | Substitute a documented set of confusable characters and inspect character/script evidence. | Positive and benign multilingual fixtures; no guessed recovery or automatic malicious verdict. |
| [0.0.3](https://github.com/squinky86/DIMWIT/milestone/3) | Insert bounded directional controls and inspect logical order and unmatched sequences. | Nested/unbalanced and legitimate RTL fixtures; preview cannot reorder surrounding UI. |
| [0.0.4](https://github.com/squinky86/DIMWIT/milestone/4) | Generate Base64/hexadecimal wrappers and inspect bounded decoded payloads. | Unicode round trips, malformed-data handling and size/depth limits; heuristic candidates remain distinct. |
| [0.0.5](https://github.com/squinky86/DIMWIT/milestone/5) | Carry payloads in HTML comments and inspect pasted HTML/Markdown source. | Delimiter handling, inert rendering and explicit source-versus-rendered-copy limits. |
| [0.1.0](https://github.com/squinky86/DIMWIT/milestone/6) | Broader beta use with a reviewed method contract and documented coverage. | Cross-method, browser, accessibility, dependency and release gates passed. |

Each later alpha also requires selector integration, source-span findings, malformed and benign examples, copy/paste checks, generated documentation, changelog, an immutable version tag and a GitHub release marked prerelease. Release order follows the table; later methods technically depend on the shared MVP interface rather than on each other's codecs. Split later milestone issues into implementation tasks before starting them. If an intervening fix needs a release, use the next unused alpha version and adjust unreleased milestones together.

## 0.0.1 work breakdown

| Issue | Deliverable | Depends on |
| --- | --- | --- |
| [#1](https://github.com/squinky86/DIMWIT/issues/1) | Review prototype and specify alphabet, framing, versioning, limits, verdicts and test vectors. | Prototype access or an explicit decision to proceed without it. |
| [#2](https://github.com/squinky86/DIMWIT/issues/2) | Jekyll/Alpine structure, root application, method registry and local processing. | #1 |
| [#3](https://github.com/squinky86/DIMWIT/issues/3) | Non-printing text generation and supported-frame decoding. | #1, #2 |
| [#4](https://github.com/squinky86/DIMWIT/issues/4) | Independent pasted-text inspection with code points, spans and cautious verdicts. | #1, #2 |
| [#5](https://github.com/squinky86/DIMWIT/issues/5) | Accessible selector, Generate/Inspect flows, copy/reset, shared SVG and docs navigation. | #3, #4 |
| [#6](https://github.com/squinky86/DIMWIT/issues/6) | Codec/detector regressions and recorded browser, keyboard and clipboard checks. | #3, #4, #5 |
| [#7](https://github.com/squinky86/DIMWIT/issues/7) | Generated user/developer docs, AGPL notices and shared branding. | #1, #2, #5 |
| [#8](https://github.com/squinky86/DIMWIT/issues/8) | Lockfiles, Dependabot, security alerts and owner notification setup. | #2 |
| [#9](https://github.com/squinky86/DIMWIT/issues/9) | PR validation and tested default-branch Pages deployment. | #2, #6, #7, #8 |
| [#10](https://github.com/squinky86/DIMWIT/issues/10) | Acceptance evidence, version consistency, changelog and v0.0.1 release. | #1–#9 |

Generation and inspection can proceed in parallel after the format and shared interface are agreed. Dependency setup can run alongside them. Documentation and test preparation can begin early; their issue dependencies describe completion gates. Wire CI early and finish deployment verification after the application and docs are available.

## MVP acceptance walkthrough

1. Open the Pages root and find the application, logo, method selector and documentation link.
2. Generate text using the non-printing method and a known payload. Copy it and paste it into Inspect.
3. Recover the supported payload and see its character evidence and locations without changing the input.
4. Paste benign multilingual text, emoji, damaged frames and unsupported suspicious characters. Results distinguish evidence and uncertainty without calling the text universally safe or malicious.
5. Complete the same core flows with a keyboard, at a mobile viewport and when clipboard access fails. Decoded markup remains inert.
6. Verify generated docs, AGPL/source links, locked builds, automated checks, dependency update configuration and the published alpha release.

## Prototype and scope decisions

The supplied `~/projects/watermark` directory was empty during planning. Issue #1 tracks locating and reviewing the prototype before the codec is finalized. Its design is inspiration, not a UI or implementation compatibility requirement.

The application adds text carriers and inspects available evidence. Model invocation, automatic interception of third-party traffic, browser extensions, document upload/parsing, general semantic prompt-injection detection and guaranteed model compliance are outside these milestones. Removing or normalizing suspected characters is not part of the MVP; the original input is always preserved.

The original SVG assets and initial AGPL/README/planning documents are delivered with this plan. Application integration, generated documentation, dependency automation and deployment remain 0.0.1 work.

## Keeping the plan current

GitHub milestones and their linked issues are the execution record. Keep acceptance criteria and dependencies current as decisions are made; link implementation PRs to their issues and record validation evidence before closing them. Use open, in-progress via an associated PR, and closed as the basic progress model without requiring a separate project board.

Update this roadmap when release scope changes. Close milestones only after their release gates pass. Future releases should document supported methods, codec compatibility changes and known gaps; personal notification settings and checks that have not run must remain explicit. No scheduled maintenance or autonomous background monitoring is configured.
