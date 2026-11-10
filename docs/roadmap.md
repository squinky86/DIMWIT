![DIMWIT logo](../assets/images/dimwit-logo.svg)

# DIMWIT release roadmap

DIMWIT is a browser-based technique demonstrator and pasted-text inspector. Demonstrate lets a user select an injection technique and create a safe example. Inspect runs every supported analyzer against pasted text and explains the evidence it finds without requiring the user to select or identify a carrier method.

The first alpha delivers the non-printing-text proof of concept. Later alphas add visible, Unicode, encoded, and indirect injection families. The beta release combines them into one inspection workbench. The application does not claim to prove intent, authorship, model obedience, or universal prompt safety.

**Implementation status:** 0.0.1 is accepted for release with an independent Unicode-tag mapping, passing production build, Chromium/Firefox regression, and Orca speech-output verification. Issue #10 records the immutable release and deployment. Later alpha families are the remaining implementation work.

Develop directly on `main` / HEAD throughout alpha and beta without development pull requests. Backward compatibility is never required, including in later releases. Interfaces, formats, and behavior may change or be removed; old behavior does not need compatibility layers or migration support.

Unicode-tag generation, known subdivision-flag context, and the basic default-ignorable/format-control inventory are delivered in this MVP. Milestone 0.0.3 extends that baseline with variation-selector payloads, confusables, bidi pairing, unusual whitespace, normalization comparisons, and more complete context validation.

## Milestone sequence

| Milestone | User-visible outcome | Exit gate |
| --- | --- | --- |
| [0.0.1](https://github.com/squinky86/DIMWIT/milestone/1) | Demonstrate one non-printing-text technique and automatically inspect pasted text for hidden characters and recoverable content. | All MVP issues accepted, application and docs deployed, and v0.0.1 released. |
| [0.0.2](https://github.com/squinky86/DIMWIT/milestone/2) | Demonstrate direct and structural injection, including instruction overrides, role impersonation, delimiter breakouts, and prompt-extraction requests. | Safe examples, explainable lexical and structural findings, quoted-example controls, and v0.0.2 released. |
| [0.0.3](https://github.com/squinky86/DIMWIT/milestone/3) | Demonstrate and inspect Unicode deception: tag characters, variation selectors, zero-width characters, confusables, bidirectional controls, unusual whitespace, and normalization differences. | Raw/rendered/escaped views, legitimate multilingual and emoji fixtures, isolated bidi rendering, and v0.0.3 released. |
| [0.0.4](https://github.com/squinky86/DIMWIT/milestone/4) | Demonstrate and inspect encoded or obfuscated text, including Base64, Base64URL, hexadecimal, percent encoding, character references, Unicode escapes, and text-evasion examples. | Bounded decoding, visible transformation paths, benign data fixtures, explicit heuristic labels, and v0.0.4 released. |
| [0.0.5](https://github.com/squinky86/DIMWIT/milestone/5) | Demonstrate indirect injection in pasted HTML, Markdown, and source-like text without rendering or fetching it. | Comments, metadata, attributes, hidden-content indicators, Markdown destinations, inert output, and v0.0.5 released. |
| [0.0.6](https://github.com/squinky86/DIMWIT/milestone/7) | Explore safe scenarios for injected email, web and document content, code comments, retrieved context, fake tool results, memory manipulation, and dummy-data exfiltration. | Scenario boundaries and expected evidence documented; no model, network target, or external content invoked; v0.0.6 released. |
| [0.1.0](https://github.com/squinky86/DIMWIT/milestone/6) | Inspect text through all analyzers with layered findings, exact evidence, incomplete-scan reporting, and documented coverage. | Cross-technique, benign, multilingual, accessibility, browser, dependency, and deployment gates passed; v0.1.0 released as beta. |

Each alpha adds a coherent technique family to both Demonstrate and Inspect where static analysis is meaningful. Demonstrations may include examples that cannot be reliably recognized in arbitrary prose; those remain educational examples rather than detector promises. Every release requires safe inert rendering, source-span evidence, benign counterexamples, generated documentation, a changelog, an immutable version tag, and a GitHub release marked prerelease.

## Application workflows

### Demonstrate

Demonstrate is the default workflow, with a ready-made example. The user selects a technique and edits its fields; the preview updates after a fixed 0.6-second pause. Rendered, raw, and escaped forms share one preview area beside the input. Safe built-in examples use fixed markers and dummy data. DIMWIT never sends a demonstration to a model or external service.

### Inspect

The user pastes text once; inspection starts automatically 0.6 seconds after typing or pasting stops. DIMWIT runs every supported analyzer and may return several independent findings beside the input. Each finding names the observed evidence and retains its exact source span, explanation, and escaped context in expandable details. Unambiguous encodings may be decoded within strict size and depth limits, but DIMWIT does not attribute the text to a watermarking tool or carrier implementation.

The inspector uses these outcome states:

- Hidden or encoded content detected.
- Injection-like instruction detected.
- Non-rendered markup contains instructions or active-content indicators.
- Malformed or suspicious structural evidence detected.
- No supported indicators found.
- Inspection incomplete.

These states can coexist. “No supported indicators found” applies only after every enabled analyzer completes. It does not mean that the text is safe.

## 0.0.1 work breakdown

| Issue | Deliverable | Depends on |
| --- | --- | --- |
| [#1](https://github.com/squinky86/DIMWIT/issues/1) | Specify the non-printing demonstration, hidden-character inventory, limits, evidence, and test vectors; compare the optional prototype when available. | The reference was empty; the independent mapping is documented for review. |
| [#2](https://github.com/squinky86/DIMWIT/issues/2) | Establish Jekyll and Alpine.js structure, technique modules, separate Demonstrate and Inspect flows, and local processing. | #1 |
| [#3](https://github.com/squinky86/DIMWIT/issues/3) | Generate a safe non-printing demonstration and recover content when its transformation is unambiguous. | #1, #2 |
| [#4](https://github.com/squinky86/DIMWIT/issues/4) | Automatically inspect pasted text for hidden characters, controls, malformed sequences, and recoverable content. | #1, #2 |
| [#5](https://github.com/squinky86/DIMWIT/issues/5) | Build the accessible Demonstrate selector and method-free Inspector with copy, reset, raw, rendered, and escaped views. | #3, #4 |
| [#6](https://github.com/squinky86/DIMWIT/issues/6) | Verify transformation correctness, Unicode handling, benign examples, evidence spans, and browser workflows. | #3, #4, #5 |
| [#7](https://github.com/squinky86/DIMWIT/issues/7) | Publish generated user/developer docs, inspection limits, AGPL notices, and shared branding. | #1, #2, #5 |
| [#8](https://github.com/squinky86/DIMWIT/issues/8) | Commit lockfiles, retain security alerts, and report dependency updates in issues for manual resolution without automatic PRs or code changes. | #2 |
| [#9](https://github.com/squinky86/DIMWIT/issues/9) | Validate `main` commits and deploy a tested application and documentation artifact through GitHub Actions. | #2, #6, #7, #8 |
| [#10](https://github.com/squinky86/DIMWIT/issues/10) | Record acceptance evidence and publish the v0.0.1 alpha release. | #1–#9 |

Generation and inspection can proceed in parallel after the initial transformation and evidence model are agreed. Dependency automation can run alongside them. Documentation and test preparation should begin early; their dependencies describe completion gates.

## Later alpha and beta issues

| Issue | Milestone | Scope |
| --- | --- | --- |
| [#16](https://github.com/squinky86/DIMWIT/issues/16) | 0.0.2 | Direct instruction override and structural injection demonstrations with explainable heuristic findings. |
| [#11](https://github.com/squinky86/DIMWIT/issues/11) | 0.0.3 | Confusable substitution and mixed-script evidence. |
| [#12](https://github.com/squinky86/DIMWIT/issues/12) | 0.0.3 | Bidirectional-control demonstrations and isolated logical-order inspection. |
| [#17](https://github.com/squinky86/DIMWIT/issues/17) | 0.0.3 | Hidden Unicode alphabets, unusual controls and whitespace, and normalization evidence. |
| [#13](https://github.com/squinky86/DIMWIT/issues/13) | 0.0.4 | Bounded decoding and demonstrations for encoded, escaped, and text-obfuscation techniques. |
| [#14](https://github.com/squinky86/DIMWIT/issues/14) | 0.0.5 | Inert inspection and demonstrations for indirect injection in HTML, Markdown, and source-like text. |
| [#18](https://github.com/squinky86/DIMWIT/issues/18) | 0.0.6 | Safe scenario demonstrations for untrusted content, retrieval, tools, memory, and dummy-data exfiltration. |
| [#15](https://github.com/squinky86/DIMWIT/issues/15) | 0.1.0 | Unified automatic inspection, layered findings, coverage fixtures, and beta release. |

Split each later issue into implementation tasks before work starts. If an intervening fix needs a release, use the next unused alpha version and adjust unreleased milestones together.

## MVP acceptance walkthrough

1. Open the Pages root and find the application, logo, Demonstrate selector, Inspector, and documentation link.
2. Edit the default non-printing example, wait for the live preview, and compare its rendered, raw, and escaped forms.
3. Copy the result into Inspect without selecting a method. The inspector identifies the hidden evidence and recovers the demonstration content when possible.
4. Paste ordinary multilingual text, emoji, legitimate format controls, malformed hidden sequences, and unsupported suspicious text. Results distinguish exact evidence from interpretation.
5. Complete the same flows with a keyboard, at a mobile viewport, and when clipboard access fails. User-controlled content remains inert.
6. Verify generated docs, AGPL/source links, locked builds, automated checks, dependency updates, and the published alpha release.

## Detection boundaries

DIMWIT can establish that characters, encodings, markup structures, or injection-like phrases are present. It cannot determine intent from arbitrary prose or prove that a model will obey a payload. Direct and indirect injection depend on where text enters a model’s context, while model effects vary with the model, tokenizer, instructions, connected tools, and ingestion pipeline.

Carrier attribution, authenticated provenance, universal semantic detection, automatic traffic interception, remote fetching, browser extensions, PDF or Office parsing, OCR, external CSS evaluation, multimodal analysis, and live model-effectiveness testing are outside these milestones. The application preserves pasted input and never presents a transformed copy as universally safe.

The supplied `~/projects/watermark` directory was still empty during implementation. The requested MVP proceeds with the documented Unicode-tag mapping in [Hidden text & coverage](format.md). Issue #1 retains the unavailable prototype comparison for review. Its behavior is a reference rather than a compatibility requirement.

## Keeping the plan current

GitHub milestones and their linked issues are the execution record. Keep acceptance criteria and dependencies current, link commits and workflow runs to their issues, and record validation evidence before closing them. Open and closed issue states plus commit links provide progress tracking without a separate project board or pull-request workflow.

Update this roadmap when release scope changes. Close milestones only after their release gates pass. Each release documents supported analyzers, demonstration coverage, known gaps, and any incomplete checks. A weekly dependency check reports update issues for manual resolution; it does not perform autonomous code maintenance.
