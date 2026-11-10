<p align="center">
  <img src="assets/images/dimwit-logo.svg" alt="DIMWIT — a pleasantly confused lightbulb" width="480">
</p>

# DIMWIT

**Deception, Interception, & Marking Watermark Injection Toolkit**

DIMWIT is a Jekyll and Alpine.js web application for demonstrating prompt-injection techniques and inspecting pasted text for observable injection indicators. Text processing stays in your browser.

[Application on GitHub Pages](https://squinky86.github.io/DIMWIT/) · [Generated documentation](https://squinky86.github.io/DIMWIT/docs/) · [Milestones](https://github.com/squinky86/DIMWIT/milestones) · [Roadmap](docs/roadmap.md) · [Architecture](docs/architecture.md)

The **0.0.1 alpha preview is implemented on `main`**. It demonstrates non-printing text with Unicode tags and automatically inspects pasted text for hidden Unicode, format controls, malformed tag sequences, and recoverable content. Successful `main` builds publish the application and documentation to GitHub Pages for review; `v0.0.1` has not been released.

**Inspect** starts with a paste field, runs all supported checks, and shows exact positions, decoded text, escaped evidence, and incomplete-scan notices. **Demonstrate** provides the technique selector, a harmless example, rendered/raw/escaped output, and copy or direct inspection. Neither workflow sends text to a model. Findings do not establish intent or guarantee prompt safety; ordinary-language injection and other encodings remain later-milestone work.

## Release plan

| Version | Scope |
| --- | --- |
| [0.0.1](https://github.com/squinky86/DIMWIT/milestone/1) | Non-printing text MVP |
| [0.0.2](https://github.com/squinky86/DIMWIT/milestone/2) | Direct and structural injection |
| [0.0.3](https://github.com/squinky86/DIMWIT/milestone/3) | Unicode deception |
| [0.0.4](https://github.com/squinky86/DIMWIT/milestone/4) | Encoded and obfuscated injection |
| [0.0.5](https://github.com/squinky86/DIMWIT/milestone/5) | Indirect and markup injection |
| [0.0.6](https://github.com/squinky86/DIMWIT/milestone/7) | Scenario demonstrations |
| [0.1.0](https://github.com/squinky86/DIMWIT/milestone/6) | Unified inspector beta |

Versions `0.0.x` are alpha; `0.y.x` with `y >= 1` are beta. The approved roadmap and issue acceptance criteria are maintained in GitHub. No release dates are committed.

Development goes directly to `main` / HEAD throughout alpha and beta, without development pull requests. Backward compatibility is never required, including in later releases: interfaces, formats, and behavior may change or be removed as needed. Release notes describe those changes.

## Development

Use Node 24, Ruby 3.3.13, and Bundler 2.5.22. Install the compiler and Ruby development headers required by your platform, then run:

```sh
bundle config set --local path vendor/bundle
bundle install
npm ci
npm test
npm run build
npm run dev
```

Open `http://127.0.0.1:4000/DIMWIT/`. See [development instructions](docs/development.md), the [character mapping and limits](docs/format.md), and the [review checklist](docs/review.md). The prototype directory supplied for reference was empty, so the implementation uses an independently documented mapping and makes no prototype-compatibility claim.

Jekyll and Alpine.js are the major dependencies, with committed lockfiles. A weekly GitHub Actions check reports available Ruby gem, npm package, and Action updates in issues assigned to `squinky86` for manual resolution. It never changes code or lockfiles. Dependabot security alerts stay enabled; version-update and security-fix PRs are disabled. Personal notification settings determine email delivery.

GitHub Actions tests and builds `main`, then deploys its tested artifact to Pages. Both jobs use **ubuntu-26.04**, the preferred runner when compatible. Implementation tasks and release gates are tracked in [GitHub issues](https://github.com/squinky86/DIMWIT/issues), with commits and workflow runs as evidence.

## License and artwork

DIMWIT code, documentation and original SVG artwork are licensed under **AGPL-3.0-only**. See [LICENSE](LICENSE). Third-party dependencies retain their respective licenses.

The shared [logo](assets/images/dimwit-logo.svg) and [compact icon](assets/images/dimwit-icon.svg) depict a confused little lightbulb and appear in the application, documentation, and repository.
