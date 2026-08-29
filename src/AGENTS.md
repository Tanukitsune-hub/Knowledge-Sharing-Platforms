# Apps Script source instructions

Scope: files under `src/`.

- Runtime code must remain Apps Script V8-compatible plain JavaScript.
- Production execution must not depend on Node.js, TypeScript, a bundler, clasp, or an external server. Build-time release tooling may generate distribution artifacts, but the installed runtime must remain self-contained.
- `src/` is the modular source of truth. Never develop in or hand-edit `dist/KnowledgeShare.bundle.gs`; regenerate it from an exact source commit and reviewed build profile.
- Source and bundle modes must use the same business code. Distribution-specific behavior is limited to generated static resources, loader selection, release metadata, and guarded installer/readiness wrappers.
- Keep live Google service calls inside thin adapter functions; pure setup/contracts logic must remain executable with fake adapters.
- Do not perform live service calls at file load time. A generated inert HTML resource map and other deterministic pure constant initialization may be allowlisted; network, Drive, Sheets, Docs, trigger, property, provider, or installer execution at top level is forbidden.
- A `ksp` prefix does not make an Apps Script function private. Any top-level server function without a trailing `_` is potentially callable through `google.script.run`.
- Keep only the explicitly approved normal-user facade functions public. Every internal helper, adapter, administrator operation, diagnostic, maintenance job, and trigger-only handler must end with `_` or be non-top-level.
- The canonical allowlist is maintained in `scripts/public-surface.cjs`; a `ksp` prefix alone is never sufficient. Setup, status, retention, manual sync, diagnostics, and destructive Drive/Docs helpers remain private even when an editor can run them directly.
- Work 0023 may add `installKnowledgeShare()` and `checkKnowledgeShareReadiness()` as intentionally editor-visible operator wrappers. They must not be referenced by normal HTML pages, must be classified separately from the normal-user facade, and must run strict active-user/administrator authorization before any mutation because omission from the UI is not a security boundary.
- The first installer run must fail closed when active-user identity is blank or active/effective identity is ambiguous. Later runs require the authoritative administrator allowlist. Never authorize a Web App caller merely because the deployment executes as the deploying user.
- Setup, installation status/validation, retention cleanup, manual AI sync, and internal diagnostics must not be exposed as unguarded normal-user Web App operations.
- Add and maintain an automated public-surface allowlist check. Unexpected top-level public functions are a security defect and must fail `npm run check`.
- Public responses and errors must not expose backend/audit/folder/store IDs, credentials, private URLs, source bodies, raw API payloads, or stack traces.
- Bundle metadata must use the Work 0023 canonical payload-hash model. Do not embed an undefined ordinary hash of the final bundle inside the same final bytes; keep the actual final-file SHA-256 in the release manifest.
- Distribution validation must cover every `.gs` and `.html` exactly once, deterministic order, syntax, template/include resolution, function/global collisions, dangerous top-level execution, source/bundle facade and behavior parity, manifest/OAuth/service parity, reproducible hashes, secrets, installer authorization/idempotency, and exact one-paste save/execute in the target runtime.
- Schema changes are forward-only: append missing columns, preserve existing data, increment `KSP_SCHEMA_VERSION` when the persistent contract changes, and add migration tests.
- Seed repair must never overwrite user-mutable Master names, order, or status.
- Setup reruns must never reset operational ID counters or future Gemini configuration.
- Never add secrets, real record data, private URLs, or organization-specific IDs.
- Validate changes with `npm run check` from the repository root.
- Work 0013 is the active consolidated DEV live-qualification scope. Authenticated Apps Script / Workspace / Gemini DEV calls are explicitly authorized under the current Work 0013 handoffs, using synthetic or anonymized DEV data only, no secret logging, no production deployment, and no destructive production action.
- Interactive browser sign-in, OAuth consent, native file selection, and billing/account confirmation may be requested from the user only when required. Never ask the user to paste credentials, API keys, tokens, or private resource IDs into chat.
- Do not add a public qualification wrapper to reach private functions. Run private setup/status/retention/sync/diagnostic functions only through an editor/trigger or another approved DEV execution path that preserves the trailing-underscore privacy boundary.
- Work 0013 is qualification-first: do not add features or broadly refactor. Fix only defects covered by a ChatGPT-authored bounded diagnosis handoff.
- For Luna Max defect work, ChatGPT owns root-cause analysis. The handoff must state one falsifiable hypothesis, exact files/functions, expected pre-fix failing test, one minimal repair, focused checks, one live confirmation, and stop conditions.
- Luna Max must stop when the hypothesis is not reproduced, the one repair attempt fails focused checks, the live case still fails after deterministic PASS, or evidence points to another cause. It must not explore a second hypothesis or broaden the investigation in the same run.
- Subagents remain mandatory, but for bounded Luna defect work they are limited to independent hypothesis verification and patch/regression review, not competing root-cause exploration.
- Release version remains `0.1.2` unless an observed defect repair materially changes the application release contract; qualification-only evidence does not by itself require a version bump.
- Preserve the accepted Gemini-independent Knowledge Export contract: resolve Active sources from the Backend Index and keep Audit metadata-only and content-redacted.
- Use `kspCanonicalBusinessDate_`, `kspCanonicalBusinessTime_`, and `kspCanonicalInstantIso_` at temporal boundaries. Business Date/Time values use the configured `KSP_DEFAULTS.TIMEZONE`; Created/Updated/Audit/AI timestamps use UTC ISO milliseconds.
- Do not derive Business Date/Time with UTC or local calendar getters, serialize physical Sheets Date/Time values directly, or add feature-specific temporal parsing algorithms. Preserve untouched physical cells during metadata-only writes.
