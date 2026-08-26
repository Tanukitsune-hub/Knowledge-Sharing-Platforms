# Core Rules Changelog

This changelog records behavioral changes to the bounded Core Rules in root `AGENTS.md`. The canonical universal wording is maintained in `Tanukitsune-hub/dev-repo-template`; repository-specific adoption does not overwrite local architecture or product contracts.

## 2.2 — 2026-08-26

- Replaced the legacy 1.2 Core body with the compact outcome-controlled Core 2.2 contract.
- Made target-runtime-first development the default for new `BUILD` Work after active Work 0014 closes or safely stops.
- Separated the actual Apps Script / Workspace / Web App target runtime from production/confidential data, real users, billing, triggers, public exposure, destructive operations, and other consequential effects.
- Added isolated test-data/resource and side-effect boundaries.
- Added a material-justification gate for a separate DEV/Staging runtime.
- Separated `LOGIC_VALIDATION`, `TARGET_RUNTIME_QUALIFICATION`, `SIDE_EFFECT_STATE`, and `READY` in handoffs, PRs, and completion reports.
- Added Work Control and Dispatch Control routes and moved transient historical Work state out of root `AGENTS.md`.
- Added a mechanical foundation validator and explicit supersession of the former feature-complete → final DEV live qualification policy.

Historical Works and their evidence remain valid for what they observed. Adoption is prospective and does not interrupt Work 0014's active evidence boundary.

Canonical template publication: `Tanukitsune-hub/dev-repo-template` merge `9a68a1647bb6269ab6e838613f3cf0df9cbb1f21`.

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
