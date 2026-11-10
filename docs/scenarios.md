---
title: Scenario walkthroughs
permalink: /docs/scenarios/
---
# Explore a trust boundary

Choose **Scenarios** in the toolkit, select a walkthrough, and compare **Injected example** with **Benign comparison**. Each panel identifies the trusted task, untrusted source, inserted material, security objective, observable evidence, and assumptions about an external application. **Reset scenario** restores the selected walkthrough's injected example and rendered view.

Use Rendered, Raw and Escaped to examine the exact scenario source. Rendered is isolated plain text; HTML and Markdown remain inert. **Load in Demonstrate** copies the selected comparison's recipe and fields so you can edit it. **Inspect scenario** transfers the identical text into the automatic inspector, where supported decoded layers and exact source ranges are available. Loading a scenario cancels pending work for the destination workflow. Resetting the scenario does not erase an inspection you have already loaded.

All outcomes are illustrative. DIMWIT does not run an attack, measure success, call a model or tool, fetch content, write memory, or visit a destination. Fixed markers such as BANANA, DEMO_SYSTEM_PROMPT, and DEMO_SECRET_123 are fictional. All example destinations use `example.invalid`.

| Walkthrough | Boundary and observable evidence |
| --- | --- |
| Direct role impersonation | A user-supplied excerpt includes system-looking delimiters. Inspect shows the supported structure and lexical override; only an external application can assign real message roles. |
| Untrusted email with hidden text | The email body carries Unicode tags. Inspect reveals the tag payload and decoded instruction-like phrase; rendered mail copy/paste might omit the tags. |
| Hidden instructions in web source | A source section has a literal hidden attribute. Inspect locates the container and wording; external CSS and rendering are unknown. |
| Document and code comments | A comment requests a dummy system prompt. Inspect shows the comment and exact extraction phrase; there is no actual private prompt in the example. |
| Encoded retrieved context | A fictional passage is Base64 encoded. Inspect recovers UTF-8 and shows its transformation path; no retrieval happens. |
| Fake tool result with selector text | A fabricated inventory result carries framed variation selectors. Inspect recovers the instruction, without claiming tool provenance or privileges. |
| Proposed memory manipulation | A fictional note asks to change future behavior. Inspect sees a supported override structure; no memory is stored or edited. |
| Dummy-data exfiltration | A reserved image URL contains DEMO_SECRET_123 and an instruction asks to include it in a response. Inspect shows the destination and wording; no request is issued. A real effect would require an external renderer or tool. |
| Obfuscated source instruction | A labeled typoglycemia example rearranges internal letters. Inspect recognizes the frame; reliable recognition of meaning or evasion success is not claimed. |
| Layered retrieved template | Base64 contains template source containing Unicode tags. Inspect keeps Base64 → tag recovery, container evidence, and lexical matches independent, with separate original/decoded ranges. |

Benign comparisons intentionally reuse structures and encodings. A benign tag payload still contains hidden text, and a benign comment still has source boundaries. Findings are observations rather than a binary safe/malicious verdict. They do not establish intent, authorship, external trust placement, or model obedience.

To trace the layered example, select **Layered retrieved template**, inspect it, and expand the findings. The Base64 finding exposes template source; the container finding describes its source span within decoded layer 1; the tag finding reveals the inserted instruction; the lexical finding has a `base64 → Unicode tags` path and decoded-layer 2 offsets. Selecting any nested finding highlights its original encoded ancestor, not an invented one-to-one mapping into Base64 characters.

Read [techniques and limits]({{ '/docs/format/' | relative_url }}) for the supported recipes, parser subsets and shared decoding budgets.
