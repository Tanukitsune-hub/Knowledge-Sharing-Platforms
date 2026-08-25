# Documentation

本ディレクトリはKnowledge Sharing Platformsの現行product、architecture、runtime、security、delivery decisionsを記録する。

2026-08-14に旧計画を破棄し、Google Workspace中心の蓄積基盤へ再設計した。2026-08-15以降にGemini File Search、5モードKnowledge Search、Apps Script-first、upload / audit / actor等を採用した。2026-08-26に、別DEV runtimeをfeature-completeさせてから最終実機へ移す方式をsupersedeし、actual target runtime + isolated test data/resources + guarded side effectsを標準とした。

Historical Work/qualification files remain evidence of what they observed. They are not the current environment strategy.

## Current sources of truth

- `product/vision.md`: product purpose / UX
- `architecture/target-architecture.md`: architecture boundaries
- `planning/mvp-and-roadmap.md`: product phases / roadmap
- `planning/apps-script-implementation-plan.md`: current target-runtime-first implementation / validation sequence
- `operations/runtime-policy.md`: runtime identity / access / retry / audit / AI sync / rollout
- `ai/gemini-file-search.md`: File Search / metadata / five modes / citations / AI index
- `governance/security.md`: information handling / credentials / access / restricted Audit
- `agent-governance/work-control.md`: work modes / target-runtime path / evidence / bounds / completion
- `agent-governance/dispatch-control.md`: Work ID / Dispatch ID / ball / status
- `decisions/target-runtime-first-development.md`: environment, isolated data, side-effect, staging, readiness decision
- `decisions/decision-log.md`: consolidated durable decisions
- `decisions/apps-script-first-implementation.md`: Apps Script-first setup/delivery boundary
- `decisions/pitchbook-upload-limits.md`: 25MB/file, 10 files, 100MB total
- `decisions/audit-access-and-user-attribution.md`: best-effort Actor / separate Restricted Audit Spreadsheet
- `decisions/implementation-first-final-live-qualification.md`: superseded historical policy

## Authority / conflict handling

1. latest explicit user decision;
2. closest current domain-specific source;
3. current architecture / planning / runtime documents;
4. historical Work/handoff/decision wording.

Current domain authority:

- implementation / validation sequence: `planning/apps-script-implementation-plan.md`
- target runtime / data / side effects / staging: `decisions/target-runtime-first-development.md`
- runtime operations / rollout: `operations/runtime-policy.md`
- retrieval: `ai/gemini-file-search.md`
- security: `governance/security.md`
- upload limits: `decisions/pitchbook-upload-limits.md`
- actor / Audit access: `decisions/audit-access-and-user-attribution.md`

Do not restore wording that requires permanent DEV/PROD project separation, defers all target-runtime evidence until feature-complete, treats CI/mock/test-loader PASS as native readiness, requires persistent user identity, requires an Audit Viewer, or restores 100MB/file without new material evidence and an explicit decision.

## Current implementation baseline

- one organization-controlled Apps Script HTML Service Web App
- Shared Drive authoritative source
- five-sheet baseline backend with append-only schema evolution
- separate Restricted admin-only Audit Spreadsheet
- Meeting / Pitchbook register + past records + edit + deactivate/reactivate
- GP / Option Masters and accepted later structured fields
- 24h browser drafts
- upload: 25MB/file, 10 files, 100MB total
- best-effort Actor: email → temporary user key → `UNIDENTIFIED`
- Gemini File Search as one derived/rebuildable Store
- common Active-source access for authorized Web App users
- configured Gemini Flash model when approved
- bounded AI sync worker
- `.pdf / .pptx / .xlsx / .docx / .txt / .eml`
- Knowledge Search: `自由質問 / 要約 / 時系列 / 比較 / 面談準備`
- Knowledge Export as a Gemini-independent derived-copy path
- explicit normal-user Apps Script facade; private setup/status/trigger/diagnostic/destructive helpers

## Current development and validation path

```text
bounded preflight
→ shortest coherent vertical slice in production source paths
→ actual Apps Script / Workspace / Web App target runtime
→ isolated synthetic or anonymized test data/resources
→ guarded side effects
→ focused LOGIC_VALIDATION
→ bounded TARGET_RUNTIME_QUALIFICATION
→ expand only after native readback passes
→ separately authorize production data/users/billing/triggers/destructive effects
```

Separate DEV/Staging remains possible only when it provides unique material safety or evidence that cannot be obtained through isolation and guards in the target runtime.

Report:

```text
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
READY
```

A local harness, mock, simulator, alternate runtime, CI run, or test loader may establish logic but cannot establish Apps Script / Workspace / browser / Gemini behavior it did not exercise.

## Historical Work map

- 0004: scaffold + setup engine
- 0005: Meeting vertical slice
- 0006: Pitchbook vertical slice
- 0007: Masters / Audit / concurrency
- 0008: File Search client / sync / free question
- 0009: six formats / EML / five modes
- 0010: consolidated synthetic DEV qualification
- 0011: Gemini-independent Knowledge Export / external-AI handoff
- 0012: public-surface / reliability hardening
- 0013: qualification / recovery history
- 0014: structured Meeting/Pitchbook context foundation and bounded repair

Work 0014 completes or safely stops under PR #17's existing evidence boundary. New Work applies the 2026-08-26 policy prospectively.

## Operating documents

- `repository-initialization.md`
- `handoff-template.md`
- `handoffs/`
- `agent-governance/work-control.md`
- `agent-governance/dispatch-control.md`
- `core-rules-changelog.md`
- `../tools/validate_agent_foundation.py`

Operating documents govern execution and evidence; they do not silently alter accepted product/domain contracts.
