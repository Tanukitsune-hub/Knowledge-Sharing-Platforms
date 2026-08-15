# Documentation

本ディレクトリはKnowledge Sharing Platformsの現行方針を記録する。

2026-08-14に旧計画を破棄し、Google Workspace中心のシンプルな蓄積基盤から再設計した。2026-08-15にGemini File Search / 5モードKnowledge Search / Apps Script-first実装方針を採用し、2026-08-16にupload上限とaudit / actor運用をさらに単純化した。

## Current sources of truth

- `product/vision.md`: product purpose / UX
- `architecture/target-architecture.md`: architecture boundaries
- `planning/mvp-and-roadmap.md`: accepted phases / validation / genuine remaining choices
- `planning/apps-script-implementation-plan.md`: setup / Work sequence / acceptance / ChatGPT-Codex routing
- `operations/runtime-policy.md`: runtime / upload / retry / audit / actor / sync
- `ai/gemini-file-search.md`: File Search / metadata / five modes / citations / AI index
- `governance/security.md`: information handling / credentials / common access boundary / restricted audit
- `decisions/decision-log.md`: consolidated durable decisions
- `decisions/gemini-file-search-retrieval.md`: Gemini retrieval decision
- `decisions/apps-script-first-implementation.md`: Apps Script-first delivery decision
- `decisions/pitchbook-upload-limits.md`: 25MB/file, 10 files, 100MB total
- `decisions/audit-access-and-user-attribution.md`: best-effort Actor / separate Restricted Audit Spreadsheet

## Authority / conflict handling

1. latest explicit user decision
2. closest domain-specific source
3. current planning / architecture documents
4. historical wording

Current domain authority:

- implementation / setup: `planning/apps-script-implementation-plan.md`
- runtime / audit / actor: `operations/runtime-policy.md`
- retrieval: `ai/gemini-file-search.md`
- security: `governance/security.md`
- upload limits: `decisions/pitchbook-upload-limits.md`
- actor / audit access: `decisions/audit-access-and-user-attribution.md`

Older wording that still states `100MB/file`, `500MB/batch`, mandatory persistent user identity, or mandatory Web App Audit Viewer is superseded and must not be restored.

## Current implementation baseline

- one organization-controlled Apps Script HTML Service Web App
- Shared Drive authoritative source
- 5-sheet backend
- separate Restricted admin-only Audit Spreadsheet
- Meeting / Pitchbook register + past records + edit + deactivate/reactivate
- GP / Option Masters
- 24h browser drafts
- upload: 25MB/file, 10 files, 100MB total
- best-effort Actor: email → temporary user key → `UNIDENTIFIED`
- persistent actual-user identity is not a release requirement
- Web App internal Audit Viewer is not required initially
- Gemini File Search: one derived Store
- common Active-source access for authorized Web App users
- one Gemini Flash model
- 15-minute AI sync
- `.pdf / .pptx / .xlsx / .docx / .txt / .eml`
- Knowledge Search: `自由質問 / 要約 / 時系列 / 比較 / 面談準備`
- ChatGPT owns design/GitHub/review/completion; Codex handles residual implementation/runtime work

## Implementation Works

- 0004: scaffold + idempotent setup
- 0005: Meeting vertical slice
- 0006: Pitchbook vertical slice
- 0007: maintenance / concurrency / Masters / Phase 1 qualification
- 0008: File Search thin slice + 自由質問
- 0009: 15-minute sync + six formats + EML
- 0010: four presets + production qualification

詳細は`planning/apps-script-implementation-plan.md`を参照する。

## Operating documents

- `repository-initialization.md`
- `handoff-template.md`
- `handoffs/`
- `core-rules-changelog.md`

Operating documents are not product specifications and do not override current domain-specific sources.
