# Codex handoff authoring instructions

Scope: files under `docs/handoffs/`.

These rules supplement the repository root and other applicable `AGENTS.md` files. They do not replace or duplicate those rules.

- When ChatGPT prepares or updates a Codex handoff, optimize it for execution rather than open-ended design.
- State the outcome, already-decided design choices, source of truth, required scope, non-goals, acceptance criteria, validation evidence, and escalation conditions.
- Do not prescribe implementation steps that Codex can safely determine from the repository.
- Do not duplicate stable rules already contained in an applicable `AGENTS.md`; rely on or reference them instead.
- Every Apps Script project, version, deployment, or Web App recovery handoff must follow `docs/operations/apps-script-web-app-deployment.md`.
- Such a handoff must fix the identity chain from exact Git ref through Apps Script project, remote source, immutable version, deployment, entrypoint type, execute-as/access, browser account, and observed execution before authorizing source changes.
- When project/deployment/entrypoint state is the unresolved layer, freeze application source and authorize no more than one bounded deployment mutation per run.
- Do not treat Library deployments as Web Apps, a missing `.clasp.json` as authoritative identity loss, deterministic tests as live proof, or `/dev` PASS as a universal prerequisite for a versioned `/exec` test.
- Require stop-on-first-failure, no second deployment, no speculative source repair, authoritative integrity readback, and secret/ID/URL redaction.