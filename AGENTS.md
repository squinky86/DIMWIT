# DIMWIT working rules

- Work directly on `main` / HEAD throughout alpha (`0.0.x`) and beta (`0.y.x`). Do not create development branches or pull requests. Commit and push authorized work to `main` after appropriate checks.
- Backward compatibility is never required, including after alpha and beta. Change or remove interfaces, formats, and behavior as needed; do not add legacy adapters, migrations, aliases, or compatibility tests solely to preserve previous behavior.
- Continue to handle malformed and unsupported input explicitly and preserve user text during inspection. These are current product requirements.
- Keep GitHub issues, milestones, repository documentation, and release notes aligned with the implementation. Link commits and workflow runs as evidence.
- Use Jekyll and Alpine.js. The Pages root is the application; generated documentation lives under `/docs/`. Keep user text processing local and render all user-controlled content as inert text.
- Prefer `ubuntu-26.04` for GitHub Actions when it supports the required tooling.
- Use current stable supported dependencies. Prefer maintained release references such as `actions/checkout@v7` and `ruby/setup-ruby@v1` over commit hashes. Keep package lockfiles; respect upstream dependency requirements and document upgrades that need a newer parent release.
- Dependency automation reports updates as GitHub issues assigned to the maintainer. It must not open PRs, commit code, or update lockfiles. Keep Dependabot vulnerability alerts enabled; version-update PRs and automatic security-fix PRs are disabled. The maintainer resolves dependency issues manually.
- Run checks appropriate to each change. Production deployment follows a successful `main` build. Version tags identify releases and must not be rewritten.
