<p align="center">
  <img src="assets/images/dimwit-logo.svg" alt="DIMWIT — a pleasantly confused lightbulb" width="480">
</p>

# DIMWIT

**Deception, Interception, & Marking Watermark Injection Toolkit**

DIMWIT is a planned Jekyll and Alpine.js web application for demonstrating prompt-injection techniques and inspecting pasted text for observable injection indicators.

[Application on GitHub Pages](https://squinky86.github.io/DIMWIT/) · [Source repository](https://github.com/squinky86/DIMWIT) · [Milestones](https://github.com/squinky86/DIMWIT/milestones) · [Roadmap](docs/roadmap.md) · [Architecture](docs/architecture.md)

The project is in planning. The application and generated documentation are not deployed yet. The first release, **0.0.1**, will provide a non-printing-text demonstration and an automatic paste-to-inspect workflow. The main site will be the application, with documentation linked at `/DIMWIT/docs/`.

Demonstrate will provide the technique selector and safe examples. Inspect will run every supported analyzer automatically, show exact evidence, and require no carrier or method selection. It cannot determine the intent of arbitrary text or guarantee that a prompt is safe.

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

## Development

Implementation tasks, dependencies and release gates are tracked in [GitHub issues](https://github.com/squinky86/DIMWIT/issues). See the [0.0.1 work breakdown](docs/roadmap.md#001-work-breakdown). Build and run instructions will arrive with the application foundation.

Jekyll and Alpine.js are the intended major dependencies. The plan uses lockfiles and Dependabot for Ruby gems, npm packages, and GitHub Actions, with update pull requests assigned to the maintainer.

## License and artwork

DIMWIT code, documentation and original SVG artwork are licensed under **AGPL-3.0-only**. See [LICENSE](LICENSE). Third-party dependencies retain their respective licenses.

The shared [logo](assets/images/dimwit-logo.svg) and [compact icon](assets/images/dimwit-icon.svg) depict a confused little lightbulb. Application and generated documentation integration are included in 0.0.1.
