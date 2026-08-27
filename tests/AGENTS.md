# Local test instructions

Scope: files under `tests/` and `scripts/`.

- Use Node standard-library tooling only unless a later Work demonstrates a material need for a dependency.
- Tests must be deterministic and must not contact Google Workspace, Gemini, or any external network.
- Exercise pure logic through the same `.gs` source files loaded into a VM context; do not maintain a parallel implementation for tests.
- Fake adapters should model only observable service contracts needed by the tests.
- Test harnesses may stub external services and adapter boundaries, but must not define production-named business helpers that are absent from the source tree. A deterministic PASS must never depend on business logic available only inside the test bootstrap.
- Add regression coverage for every discovered idempotency, migration, retry, or data-preservation defect.
- Tests for Google Sheets date fields must cover the configured application timezone and preserve untouched Date/Time cell values and types.
- Metadata-only updates must assert that unrelated Date/Time columns are not written.
- Read-only workspace tests must prove exact full-set counts separately from capped display arrays and reject write/audit/AI adapter use.
- The canonical local command is `npm run check`.
