# Apps Script source instructions

Scope: files under `src/`.

- Runtime code must remain Apps Script V8-compatible plain JavaScript.
- Production execution must not depend on Node.js, TypeScript, a bundler, clasp, or an external server.
- Keep live Google service calls inside thin adapter functions; pure setup/contracts logic must remain executable with fake adapters.
- Do not perform live service calls at file load time.
- Public administrator entry points are defined in `99_EntryPoints.gs`; internal functions use the `ksp` prefix.
- Schema changes are forward-only: append missing columns, preserve existing data, increment `KSP_SCHEMA_VERSION` when the persistent contract changes, and add migration tests.
- Seed repair must never overwrite user-mutable Master names, order, or status.
- Setup reruns must never reset operational ID counters or future Gemini configuration.
- Never add secrets, real record data, private URLs, or organization-specific IDs.
- Validate changes with `npm run check` from the repository root.
- Work 0010 is the authorized final DEV live-qualification Work. Authenticated Apps Script / Workspace / Gemini calls are allowed only within the scoped Work 0010 handoff, with synthetic or anonymized DEV data, no secret logging, and no production deployment or destructive production action.
- During Work 0010, fix only defects observed by full-checkout or live qualification; do not expand the feature-frozen product scope.
