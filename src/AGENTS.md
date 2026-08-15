# Apps Script source instructions

Scope: files under `src/`.

- Runtime code must remain Apps Script V8-compatible plain JavaScript.
- Production execution must not depend on Node.js, TypeScript, a bundler, clasp, or an external server.
- Keep live Google service calls inside thin adapter functions, primarily `20_LiveEnvironment.gs`; pure setup/contracts logic must remain executable with fake adapters.
- Do not perform live service calls at file load time.
- Public administrator entry points are defined in `99_EntryPoints.gs`; internal functions use the `ksp` prefix.
- Schema changes are forward-only: append missing columns, preserve existing data, increment `KSP_SCHEMA_VERSION` when the persistent contract changes, and add migration tests.
- Seed repair must never overwrite user-mutable Master names, order, or status.
- Setup reruns must never reset operational ID counters or future Gemini configuration.
- Never add secrets, real record data, private URLs, or organization-specific IDs.
- Validate changes with `npm run check` from the repository root.
- Live Apps Script/Workspace/Gemini qualification is deferred to the final qualification Work unless a platform-contract ambiguity blocks implementation.
