---
title: Techniques and coverage
permalink: /docs/format/
---
# Techniques and inspection coverage

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

The checked-in tables come from **Unicode 18.0.0**. The character inventory and variation-pair tables are deterministic across browsers. Normalization and Latin/Greek/Cyrillic script-property comparisons use the browser’s Unicode implementation. The baseline surfaces:

- All `Default_Ignorable_Code_Point` ranges in the pinned DerivedCoreProperties data.
- All `Cf` format characters in the pinned UnicodeData data.
- C0 controls except tab, LF, and CR, plus DEL and C1 controls.
- Unpaired UTF-16 surrogates as malformed text.

Adjacent repeats of the same ordinary control are grouped into a single finding with a count. Tag runs are grouped separately. Each finding includes readable names where Unicode provides them, code points, and exact source ranges. Reserved default-ignorables receive an explicit fallback name.

Legitimate joiners, variation selectors, byte-order marks, emoji, and directional controls are described as formatting evidence. The extensions below add defined variation, bidi, confusable, normalization, and direct-text coverage. They do not establish intent. General markup inspection remains later-alpha work; bounded encoding inspection is described below.

## Positions and budgets

Source ranges are zero-based, end-exclusive UTF-16 offsets matching browser textarea selection APIs. Code-point ranges are shown separately; the Select characters button uses the UTF-16 range. A code-point position is not a user-perceived grapheme position: a family emoji or a letter plus accent can contain several code points. This distinction is labeled rather than guessed.

The original-input scan is limited to 50,000 units and results to 200 findings across all analyzers and decoded layers. An input cut never splits a valid surrogate pair. Failed checks and limited scans cannot produce a complete no-findings result. Escaped context is bounded so a large run cannot expand a finding without limit.

## Sources and maintenance

The [Unicode Standard chapter on special characters](https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-23/) describes tag and format characters. The generated tables retain the Unicode license. Maintainers can regenerate them with `scripts/build-unicode-data.mjs` by passing a directory with official Unicode 18.0.0 `DerivedCoreProperties.txt`, `UnicodeData.txt`, `StandardizedVariants.txt`, and `emoji-variation-sequences.txt`; normal builds use the committed tables and make no Unicode-data request.

## Direct and structural text (0.0.2)

The four recipes are `override`, `role`, `breakout`, and `extraction`. Their exact envelope is `[[DIMWIT:NAME]]`, newline, recipe body, newline, `[[/DIMWIT:NAME]]`. Role bodies wrap the payload in `<|im_start|>system` plus a newline and a newline plus `<|im_end|>`. Breakout bodies prepend a triple-backtick line and `</context>` line, and append `<context>` and a triple-backtick line. Override and extraction bodies are the payload itself. The unchanged cover precedes the envelope with one newline when nonempty. Payloads must be well-formed Unicode, 1–1,024 UTF-16 units, without reserved DIMWIT boundary markers. The output must fit 50,000 units. Anyone can reproduce these structures; matching does not identify their author or originating software.

Independent heuristic rules surface English ignore/disregard/forget-previous-instructions phrases, print/reveal/show/repeat/disclose-system/developer-prompt phrases, selected system/developer role labels, triple-backtick fences, and context/instruction/system delimiters. Each finding names its rule and exact source range. Quotations, manuals, and source-code examples can match. Text resembling a system message does not gain privileges inside pasted content. Other wording and languages are not reliable semantic-detection targets.

Missing or inconsistent supported framing produces partial evidence and an incomplete result. Tests include benign quotations, role labels, code fences, multilingual context, malformed framing, combined Unicode evidence, and repeated matches at the finding limit. All previews remain inert text.

## Unicode extensions (0.0.3)

**Variation-selector payloads:** well-formed Unicode is encoded as UTF-8 bytes, inside the visible literal frame `[[VS:UTF8]]` and `[[/VS]]`. Bytes 0–15 map to U+FE00–U+FE0F; bytes 16–255 map to U+E0100–U+E01EF. The cover is unchanged. Generation accepts 1–1,024 UTF-16 payload units. Inspection decodes at most 4,096 bytes and 1,024 resulting units, uses fatal UTF-8 validation, and preserves any BOM as text. Empty, interrupted, unsupported, unterminated, invalid-UTF-8, or over-budget frames make inspection incomplete without claiming successful recovery. Unframed selectors are formatting evidence, not decoded guesses. This is a documented recipe, not encryption or provenance.

Unicode 18 standardized and emoji variation pairs identify ordinary base/selector sequences. Other runs receive a contextual explanation; ideographic variation registrations and complete shaping validity are outside coverage. Known subdivision emoji flags retain their formatting status. Joiners used by emoji and connected scripts are surfaced with legitimate-use explanations. Soft hyphen, BOM, zero-width/default-ignorable characters, C0/C1 controls, Unicode space/line/paragraph separators, and four-or-more combining-mark runs remain independent evidence. The four-mark threshold is a review aid, not a linguistic validity rule. Whitespace view makes ordinary spaces, tabs and line endings visible too.

**Confusables:** generation substitutes the Latin characters `aeopcxyABCEHIKMOPTX` with the corresponding Cyrillic lookalikes in `assets/js/unicode.js`. Inspection adds a deliberately limited Greek uppercase set plus Greek omicron. The full mapping is that exported `CONFUSABLES` object, with changed code points shown in the preview. Multiple scripts can share the same Latin comparison. This is neither a complete UTS 39 implementation nor reconstruction of original spelling. Mixed-script findings cover Latin, Greek and Cyrillic within letter/mark tokens; other scripts are preserved without an attack verdict. Legitimate Greek and Cyrillic prose can produce comparison findings.

**Normalization:** NFC, NFD, NFKC and NFKD comparisons retain the original text and locate the differing source interval. The normalized comparison replaces that interval only for illustration. A comparison larger than 4,096 UTF-16 units is shown partially and marks inspection incomplete. Compatibility transformations can erase meaningful distinctions; no normalization is offered as harmless cleanup. These forms follow the browser's Unicode normalization implementation.

**Bidirectional controls:** generation offers LRE, RLE, LRO, RLO, LRI, RLI and FSI, each with the appropriate PDF or PDI closer. It inserts one balanced pair around one paragraph without existing controls; all cover code units remain unchanged. Inspection tracks up to 16 nested embedding/override/isolate openers. PDF cannot cross an isolate boundary; PDI ends its isolate and any embeddings within it. Paragraph boundaries reset the stack. Unpaired openers/closers receive explicit evidence and affected spans, while depth exhaustion makes inspection incomplete. LRM, RLM and ALM remain independent formatting evidence. This inspects logical control structure, not full visual layout, bracket resolution, or model behavior. Rendered/decoded/comparison blocks isolate directionality from application labels.

References: [Unicode variation data](https://www.unicode.org/Public/18.0.0/ucd/StandardizedVariants.txt), [emoji variation sequences](https://www.unicode.org/Public/18.0.0/ucd/emoji/emoji-variation-sequences.txt), [UAX 9](https://www.unicode.org/reports/tr9/), [UAX 15](https://www.unicode.org/reports/tr15/), and [UTS 39](https://www.unicode.org/reports/tr39/).

## Encodings and obfuscation (0.0.4)

Generated representations use the literal frame `[[ENC:CODEC]]BODY[[/ENC]]`, with one of the codec names below. Fields accept 1–1,024 well-formed UTF-16 units. Unicode is never silently replaced during encoding. The complete output fits the 50,000-unit input limit. The framing identifies a recipe, not an author.

| Codec | Generation and supported recovery |
| --- | --- |
| `base64` | RFC 4648 UTF-8 bytes, standard alphabet, canonical padding and padding bits. |
| `base64url` | UTF-8 bytes, URL-safe alphabet, unpadded output; canonical padded or unpadded input. |
| `hex` | UTF-8 bytes as two lowercase hex digits each; recovery also accepts a literal `0x` prefix. |
| `percent` | Every UTF-8 byte as `%HH`; only contiguous complete byte escapes are decoded, not an entire URL. Links are never visited. |
| `entities` | Every supported Unicode scalar as a hexadecimal numeric reference. Recovery supports decimal/hex numeric references and exactly `amp`, `lt`, `gt`, `quot`, `apos`, `nbsp`, all with semicolons. Controls other than tab/LF/CR, noncharacters, surrogates, NUL and HTML replacement mappings are rejected. This is a strict shared subset, not a full HTML parser. |
| `unicode-escapes` | Every UTF-16 code unit as a four-digit JSON-style `\uXXXX` escape. Recovery also supports JavaScript scalar `\u{...}` escapes. Surrogate pairs must be well formed; source code is never evaluated. |

Explicit malformed/unsupported frames, references or escapes produce partial evidence and an incomplete result. Byte decoders use fatal UTF-8 validation and preserve BOM characters. An invalid unframed Base64/hex guess may just be ordinary words or binary data; it is skipped rather than described as decoded text. Binary encodings are outside text-decoding coverage.

Automatic candidates include percent/reference/Unicode-escape runs, `0x` hex, and unframed hex/Base64/Base64URL tokens of at least eight characters. Hex tokens need a digit. Base64 candidates need padding/alphabet punctuation or mixed letter case plus a digit; short or ambiguous plain words are intentionally omitted. Explicit frames can recover shorter values. These candidate rules are heuristic and may miss encodings or surface ordinary encoded data. Decoding itself does not establish intent.

Inspection caps each encoded block at 16,384 units, each decoded block at 8,192 units, candidates at 100 per layer, and all decoded text at 20,000 UTF-16 units. At most three decoding steps and 32 total text layers are inspected. Hidden tag and variation-selector content shares these recursive budgets and retains its own smaller format limits. Up to 200 findings are displayed globally. Budget exhaustion never produces a no-findings success.

Every nested finding shows `Input → codec → ...`. Its source selection highlights the original encoded ancestor. The separate decoded-layer range identifies the exact matched text within the transformed content; it is never presented as an exact character mapping into the original encoding. Decoded content and comparisons remain selectable inert text. The original input is retained unchanged.

Spacing, alternating ASCII casing, leetspeak (`a/e/i/o/s/t` → `4/3/1/0/5/7`), and reversal of internal letters of ASCII words are reproducible **heuristic illustrations**. Only their labeled `[[EVASION:NAME]]...[[/EVASION]]` frames are recognized. DIMWIT does not infer semantic equivalence, recover an original sentence, or predict model behavior.

References: [RFC 4648](https://www.rfc-editor.org/rfc/rfc4648), [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986), [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259), and [HTML character references](https://html.spec.whatwg.org/multipage/named-characters.html).
