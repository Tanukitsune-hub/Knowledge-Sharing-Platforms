# Apps Script source instructions

Scope: files under `src/`.

- Runtime code must remain Apps Script V8-compatible plain JavaScript.
- Production execution must not depend on Node.js, TypeScript, a bundler, clasp, or an external server.
- Keep live Google service calls inside thin adapter functions; pure setup/contracts logic must remain executable with fake adapters.
- Do not perform live service calls at file load time.
- A `ksp` prefix does not make an Apps Script function private. Any top-level server function without a trailing `_` is potentially callable through `google.script.run`.
- Keep only the explicitly approved normal-user facade functions public. Every internal helper, adapter, administrator operation, diagnostic, maintenance job, and trigger-only handler must end with `_` or be non-top-level.
- Setup, installation status/validation, retention cleanup, manual AI sync, and internal diagnostics must not be callable from the normal-user Web App surface.
- Add and maintain an automated public-surface allowlist check. Unexpected top-level public functions are a security defect and must fail `npm run check`.
- Public responses and errors must not expose backend/audit/folder/store IDs, credentials, private URLs, source bodies, raw API payloads, or stack traces.
- Schema changes are forward-only: append missing columns, preserve existing data, increment `KSP_SCHEMA_VERSION` when the persistent contract changes, and add migration tests.
- Seed repair must never overwrite user-mutable Master names, order, or status.
- Setup reruns must never reset operational ID counters or future Gemini configuration.
- Never add secrets, real record data, private URLs, or organization-specific IDs.
- Validate changes with `npm run check` from the repository root.
- Work 0012 is the active adversarial hardening scope. Authenticated Apps Script / Workspace calls are allowed only within its handoff, using synthetic or anonymized DEV data, no secret logging, and no production deployment or destructive production action.
- Preserve the accepted Gemini-independent Knowledge Export contract: resolve Active sources from the Backend Index and keep Audit metadata-only and content-redacted.
