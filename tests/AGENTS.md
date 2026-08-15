# Local test instructions

Scope: files under `tests/` and `scripts/`.

- Use Node standard-library tooling only unless a later Work demonstrates a material need for a dependency.
- Tests must be deterministic and must not contact Google Workspace, Gemini, or any external network.
- Exercise pure logic through the same `.gs` source files loaded into a VM context; do not maintain a parallel implementation for tests.
- Fake adapters should model only observable service contracts needed by the tests.
- Add regression coverage for every discovered idempotency, migration, retry, or data-preservation defect.
- The canonical local command is `npm run check`.
