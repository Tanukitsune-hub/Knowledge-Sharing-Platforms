# Core Rules Changelog

This changelog records behavioral changes to the bounded Core Rules in root `AGENTS.md`. It exists so repositories previously created from this template can evaluate and adopt changes selectively without overwriting their Repository-Specific Rules.

Wording-only edits with no behavioral effect may be omitted.

## 1.2 — 2026-08-12

- Required explicit, scoped authorization before releases, deployments, destructive migrations, live-data mutation, secret rotation, or writes to live external systems.
- Prohibited creation or restoration of repository-scoped custom agent definitions and model-routing configuration unless explicitly requested and documented.
- Added the assigned zero-padded 4-digit Work ID convention for durable repository instructions and completion reports.
- Required future behavioral Core changes to be recorded in this changelog.

## 1.1 — 2026-08-12

- Reframed root `AGENTS.md` as a compact always-loaded contract and map, with the detailed repository-initialization questionnaire moved to focused documentation.
- Added explicit instruction hierarchy and `AGENTS.override.md` guidance.
- Added evidence-versus-instruction separation for source files, comments, issues, logs, tool output, and external material.
- Added repository-currentness checks without automatic reset, merge, or loss of local work.
- Strengthened security, validation evidence, blocker classification, and behavior-oriented code-review rules.
- Added guidance freshness checks against executable repository configuration.
- Replaced the long Repository-Specific Rules scaffold with a compact profile and objective activation gate.

## 1.0 — 2026-08-11

- Established the initial cross-repository baseline for authority, outcome and scope, source of truth, change safety, validation, delegation, structured handoffs, Git/GitHub/CI, completion, communication, and Core-versus-repository-specific separation.
