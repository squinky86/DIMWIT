---
title: Alpha release record
permalink: /docs/releases/
---
# Alpha release record

All six planned alpha versions are implemented on `main`. Each release has an immutable tag and GitHub prerelease. Pages follows the latest successful `main` build, so historical version behavior is represented by its tagged source, not by the current public application. The 0.1.0 beta remains a separate open milestone.

| Version | Scope | Release evidence |
| --- | --- | --- |
| [0.0.1](https://github.com/squinky86/DIMWIT/releases/tag/v0.0.1) | Non-printing text MVP | [Commit](https://github.com/squinky86/DIMWIT/commit/f039c67ef99f1d7456b85d98e1fbacfa0c39c092) · [Build/deploy](https://github.com/squinky86/DIMWIT/actions/runs/42882179602) · [Issue #10](https://github.com/squinky86/DIMWIT/issues/10) |
| [0.0.2](https://github.com/squinky86/DIMWIT/releases/tag/v0.0.2) | Direct and structural text | [Commit](https://github.com/squinky86/DIMWIT/commit/ab3693b93c44c308c8c7a2b280dfa39c53014805) · [Build/deploy](https://github.com/squinky86/DIMWIT/actions/runs/42883326457) · [Issue #16](https://github.com/squinky86/DIMWIT/issues/16) |
| [0.0.3](https://github.com/squinky86/DIMWIT/releases/tag/v0.0.3) | Unicode deception | [Commit](https://github.com/squinky86/DIMWIT/commit/d580d80da12b84a53015b388214735af5b1fd1bc) · [Build/deploy](https://github.com/squinky86/DIMWIT/actions/runs/42884597140) · [Issues #11](https://github.com/squinky86/DIMWIT/issues/11), [#12](https://github.com/squinky86/DIMWIT/issues/12), [#17](https://github.com/squinky86/DIMWIT/issues/17) |
| [0.0.4](https://github.com/squinky86/DIMWIT/releases/tag/v0.0.4) | Encoded and obfuscated text | [Commit](https://github.com/squinky86/DIMWIT/commit/b929f2ab5f0a99893402c746c3fdfca893bcef16) · [Build/deploy](https://github.com/squinky86/DIMWIT/actions/runs/42885621815) · [Issue #13](https://github.com/squinky86/DIMWIT/issues/13) |
| [0.0.5](https://github.com/squinky86/DIMWIT/releases/tag/v0.0.5) | Indirect and markup source | [Commit](https://github.com/squinky86/DIMWIT/commit/d59aa3c5152ea3995ecf7adfcb41bcd150962f69) · [Build/deploy](https://github.com/squinky86/DIMWIT/actions/runs/42886608736) · [Issue #14](https://github.com/squinky86/DIMWIT/issues/14) |
| [0.0.6](https://github.com/squinky86/DIMWIT/releases/tag/v0.0.6) | Local scenario walkthroughs | [Tagged source](https://github.com/squinky86/DIMWIT/tree/v0.0.6) · [Issue #18 with commit/build evidence](https://github.com/squinky86/DIMWIT/issues/18) |

Each release was verified with relevant unit/interaction fixtures, a production Jekyll build, version and generated-link checks, and Chromium/Firefox keyboard, clipboard, mobile viewport and axe checks. Orca speech-output verification covers the shared controls and scenario workflow. Coverage is detailed in the [verification record]({{ '/docs/review/' | relative_url }}). Safari, physical devices and human listening studies are not claimed.

The original prototype directory is empty; the alpha uses an independently specified Unicode-tag mapping with no compatibility claim. Backward compatibility is never required. No release tag is rewritten.
