---
title: Using DIMWIT
permalink: /docs/
---
# See what your text is carrying

DIMWIT {{ site.data.build.version }} is an alpha for demonstrating non-printing text and inspecting pasted text. It runs locally in your browser. Pasted text, generated output, and findings are not uploaded or saved.

## Demonstrate non-printing text

[The toolkit]({{ '/' | relative_url }}) opens in **Demonstrate** with a ready-made example. Edit visible cover text and the text to hide on the left; the preview on the right updates **0.6 seconds after you stop typing or pasting**. There is no Generate button or delay setting. On narrow screens, the preview sits directly below the fields.

Hidden text accepts up to 1,024 printable ASCII characters; the cover accepts Unicode. Choose whether hidden text goes before or after the cover. Input methods such as Japanese composition can finish before an update runs.

The output has three views:

- **Rendered:** how the raw characters appear as isolated plain text in your browser. This is not an HTML or Markdown renderer.
- **Raw:** the actual generated text, including the invisible characters. Copy or select this field to preserve them.
- **Escaped:** non-ASCII and control characters shown as `\u{CODEPOINT}`, `\n`, `\r`, or `\t`. This view is for reading, not for copying a working demonstration.

Switch between these views above the preview. **Copy text** always copies the complete original output, including invisible characters, even when Escaped is selected. **Select all** opens Raw and selects the complete output. **Exact changes & technique** expands character counts and mapping details without filling the main workspace.

Choose **Inspect output** to transfer the exact result, or copy it into Inspect yourself. If clipboard access fails, DIMWIT opens Raw, selects its contents, and tells you to use your device’s Copy command. Output actions are unavailable while a new preview is pending or input is invalid.

## Inspect unfamiliar text

1. Choose **Inspect text** and paste into the input field. No technique selection is needed.
2. After a 0.6-second pause, all supported checks run automatically and the summary appears beside your input.
3. Read revealed text and the evidence for each finding. **Select** highlights the exact source range in your input. **Explanation, context & exact offsets** expands the character explanation, escaped context, and numeric ranges.
4. Use **View escaped input** when you want to examine the complete input within the scan budget. Longer findings and previews scroll within their panels; content is not silently omitted.

The **Hidden instruction**, **Ordinary text**, and **Emoji & formatting** examples update immediately. Emoji, joiners, and directional formatting can legitimately produce findings. Inspect does not invoke a model, execute pasted markup, or visit links.

## Reading the results

| Result | Meaning |
| --- | --- |
| Hidden characters found | Supported non-printing or formatting characters are present. Review the individual evidence. |
| Revealed content | Printable tag characters were decoded. This reveals content, not intent or origin. |
| Formatting | A character has a formatting use, such as an emoji variation selector or text joiner. |
| Review needed | A sequence is partial, unsupported, or malformed. |
| No supported indicators found | The implemented checks finished without findings. Ordinary-language injection and other encodings remain outside this alpha’s coverage. |
| Inspection incomplete | A budget, unsupported tag sequence, unterminated tag run, or analyzer error prevented full inspection. Available evidence is still shown. |

Changing text immediately clears its old output or findings while the next update waits for your pause. Clear cancels pending inspection and empties the input; Reset example restores the default demonstration immediately. Switching workflows keeps your work in memory until you reload or close the page. Automatic updates do not move your keyboard focus.

## Limits and privacy

An inspection considers at most 50,000 UTF-16 code units, reports at most 200 findings, and decodes at most 1,024 characters per tag run. Bigger inputs receive explicit partial results. No supported findings is not a guarantee of safety, and a formatting character is not proof of an attack.

The original input is never normalized or stripped. Other apps, text editors, or models may alter hidden characters during copy/paste. Hidden tags are not encryption or authenticated provenance.

Read the [exact character mapping and coverage]({{ '/docs/format/' | relative_url }}) or the [MVP review checklist]({{ '/docs/review/' | relative_url }}).

## Credits and source

DIMWIT code, documentation, and original artwork use [AGPL-3.0-only]({{ '/LICENSE' | relative_url }}). [Source and issues]({{ site.repository }}) are public. Alpine is distributed under its [MIT license]({{ '/assets/ALPINE-LICENSE.txt' | relative_url }}), its Vue reactivity components under [MIT]({{ '/assets/VUE-LICENSE.txt' | relative_url }}), and the character tables under the [Unicode license]({{ '/assets/UNICODE-LICENSE.txt' | relative_url }}).
