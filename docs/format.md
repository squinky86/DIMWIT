---
title: Hidden text and coverage
permalink: /docs/format/
---
# The non-printing demonstration

The MVP maps printable ASCII directly into Unicode tag characters. It does not require a custom DIMWIT identifier or header, and the inspector makes no claim about which application created the text.

## Character mapping

For each payload character in `U+0020` through `U+007E`, add `0xE0000` to its code point. Append `U+E007F CANCEL TAG`, then place this sequence before or after the cover. The cover is concatenated without normalization or changes to its original code units.

| Payload | Generated code points, including terminator |
| --- | --- |
| `A` | `U+E0041 U+E007F` |
| `Hi!` | `U+E0048 U+E0069 U+E0021 U+E007F` |
| one space | `U+E0020 U+E007F` |

Each generated character occupies two UTF-16 code units. A payload of length *n* adds `2 × (n + 1)` units, including the terminator. Empty payloads, non-ASCII payloads, control characters, and payloads exceeding 1,024 characters are rejected with an explanation. An empty cover is allowed. The combined result must fit 50,000 units.

Repeated generation adds another terminated sequence. Existing cover characters, including prior hidden text, are preserved. Removing a terminator between adjacent runs can merge them; there is no checksum or way to prove that a run is unmodified.

## Recovery and malformed data

The inspector groups contiguous Unicode tag characters, ending each group at CANCEL TAG. Printable tags decode by subtracting `0xE0000`.

- A printable, terminated run reveals its contents.
- A printable run without a terminator is shown as a partial candidate and makes inspection incomplete. The software cannot establish whether bytes were lost.
- A reserved code point or LANGUAGE TAG inside a run makes that run unsupported; the inspector does not silently omit it and claim successful recovery.
- A lone CANCEL TAG is reported as malformed evidence.
- A decoding limit retains the first 1,024 decoded characters, reports the limit, and marks the scan incomplete.

England, Scotland, and Wales emoji tag sequences after `U+1F3F4 BLACK FLAG` are explicitly identified as formatting. Other tag strings are surfaced for review without being labeled malicious. The original prototype directory was unavailable; this implementation is an independent demonstration using the standard tag mapping, not a compatibility claim about that prototype.

## Exact inspection coverage

The checked-in tables come from **Unicode 17.0.0**. Coverage is deterministic across browsers and does not depend on the runtime’s Unicode property tables. The baseline surfaces:

- All `Default_Ignorable_Code_Point` ranges in the pinned DerivedCoreProperties data.
- All `Cf` format characters in the pinned UnicodeData data.
- C0 controls except tab, LF, and CR, plus DEL and C1 controls.
- Unpaired UTF-16 surrogates as malformed text.

Adjacent repeats of the same ordinary control are grouped into a single finding with a count. Tag runs are grouped separately. Each finding includes readable names where Unicode provides them, code points, and exact source ranges. Reserved default-ignorables receive an explicit fallback name.

Legitimate joiners, variation selectors, byte-order marks, emoji, and directional controls are described as formatting evidence. This alpha does not validate every emoji/variation sequence, pair bidi controls, decode variation-selector payloads, detect confusables, compare normalization forms, analyze HTML, decode Base64, or detect ordinary-language instruction overrides. Those remain roadmap work.

## Positions and budgets

Source ranges are zero-based, end-exclusive UTF-16 offsets matching browser textarea selection APIs. Code-point ranges are shown separately; the Select characters button uses the UTF-16 range. A code-point position is not a user-perceived grapheme position: a family emoji or a letter plus accent can contain several code points. This distinction is labeled rather than guessed.

Scanning stops at 50,000 units or 200 findings. An input cut never splits a valid surrogate pair. Failed checks and limited scans cannot produce a complete no-findings result. Escaped context is bounded so a large run cannot expand a finding without limit.

## Sources and maintenance

The [Unicode Standard chapter on special characters](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-23/) describes tag and format characters. The generated tables retain the Unicode license. Maintainers can regenerate them with `scripts/build-unicode-data.mjs` using the official Unicode 17.0.0 `DerivedCoreProperties.txt` and `UnicodeData.txt`; normal builds use the committed tables and make no Unicode-data request.

## Direct and structural text (0.0.2)

The four recipes are `override`, `role`, `breakout`, and `extraction`. Their exact envelope is `[[DIMWIT:NAME]]`, newline, recipe body, newline, `[[/DIMWIT:NAME]]`. Role bodies wrap the payload in `<|im_start|>system` plus a newline and a newline plus `<|im_end|>`. Breakout bodies prepend a triple-backtick line and `</context>` line, and append `<context>` and a triple-backtick line. Override and extraction bodies are the payload itself. The unchanged cover precedes the envelope with one newline when nonempty. Payloads must be well-formed Unicode, 1–1,024 UTF-16 units, without reserved DIMWIT boundary markers. The output must fit 50,000 units. Anyone can reproduce these structures; matching does not identify their author or originating software.

Independent heuristic rules surface English ignore/disregard/forget-previous-instructions phrases, print/reveal/show/repeat/disclose-system/developer-prompt phrases, selected system/developer role labels, triple-backtick fences, and context/instruction/system delimiters. Each finding names its rule and exact source range. Quotations, manuals, and source-code examples can match. Text resembling a system message does not gain privileges inside pasted content. Other wording and languages are not reliable semantic-detection targets.

Missing or inconsistent supported framing produces partial evidence and an incomplete result. Tests include benign quotations, role labels, code fences, multilingual context, malformed framing, combined Unicode evidence, and repeated matches at the finding limit. All previews remain inert text.
