---
title: Using DIMWIT
permalink: /docs/
---
# See what your text is carrying

DIMWIT {{ site.data.build.version }} is an alpha preview for demonstrating non-printing text and inspecting pasted text. It runs locally in your browser. Pasted text, generated output, and findings are not uploaded or saved.

## Inspect unfamiliar text

1. Open [the toolkit]({{ '/' | relative_url }}) and paste into **Text to inspect**.
2. Choose **Inspect text**. No method selection is needed.
3. Review each finding. Hidden tag text can reveal readable content; emoji, joiners, and directional formatting also produce explanatory findings.
4. Choose **Select characters** to select the exact evidence in your original input. Expand **Escaped context & exact offsets** for the underlying characters.

The **Hidden instruction**, **Ordinary text**, and **Emoji & formatting** examples make useful comparisons. Inspect does not invoke a model, execute pasted markup, or visit links.

## Demonstrate non-printing text

Choose **Demonstrate**, leave the technique set to Unicode tags, and supply visible cover text plus the text to hide. Hidden text accepts up to 1,024 printable ASCII characters; the cover accepts Unicode. Choose whether to prepend or append, then generate.

The output has three views:

- **Rendered:** how the raw characters appear as isolated plain text in your browser. This is not an HTML or Markdown renderer.
- **Raw:** the actual generated text, including the invisible characters. Copy or select this field to preserve them.
- **Escaped:** non-ASCII and control characters shown as `\u{CODEPOINT}`, `\n`, `\r`, or `\t`. This view is for reading, not for copying a working demonstration.

Choose **Inspect this output** to transfer the exact result, or copy it into Inspect yourself. If clipboard access fails, DIMWIT selects the raw output and tells you to use your device’s Copy command.

## Reading the results

| Result | Meaning |
| --- | --- |
| Hidden characters found | Supported non-printing or formatting characters are present. Review the individual evidence. |
| Revealed content | Printable tag characters were decoded. This reveals content, not intent or origin. |
| Formatting indicator | A character has a formatting use, such as an emoji variation selector or text joiner. |
| Review needed | A sequence is partial, unsupported, or malformed. |
| No supported indicators found | The implemented checks finished without findings. Ordinary-language injection and other encodings remain outside this alpha’s coverage. |
| Inspection incomplete | A budget, unsupported tag sequence, unterminated tag run, or analyzer error prevented full inspection. Available evidence is still shown. |

Changing pasted text clears its old results, so findings always correspond to an explicitly inspected input. Clear resets the input; switching workflows keeps your work in memory until you reload or close the page.

## Limits and privacy

An inspection considers at most 50,000 UTF-16 code units, reports at most 200 findings, and decodes at most 1,024 characters per tag run. Bigger inputs receive explicit partial results. No supported findings is not a guarantee of safety, and a formatting character is not proof of an attack.

The original input is never normalized or stripped. Other apps, text editors, or models may alter hidden characters during copy/paste. Hidden tags are not encryption or authenticated provenance.

Read the [exact character mapping and coverage]({{ '/docs/format/' | relative_url }}) or the [MVP review checklist]({{ '/docs/review/' | relative_url }}).

## Credits and source

DIMWIT code, documentation, and original artwork use [AGPL-3.0-only]({{ '/LICENSE' | relative_url }}). [Source and issues]({{ site.repository }}) are public. Alpine is distributed under its [MIT license]({{ '/assets/ALPINE-LICENSE.txt' | relative_url }}), its Vue reactivity components under [MIT]({{ '/assets/VUE-LICENSE.txt' | relative_url }}), and the character tables under the [Unicode license]({{ '/assets/UNICODE-LICENSE.txt' | relative_url }}).
