# Documentation

本ディレクトリはKnowledge Sharing Platformsの現行方針を記録する。

2026-08-14に旧計画を破棄し、Google Workspace中心のシンプルな蓄積基盤から再設計した。2026-08-15にGemini File Search / 5モードKnowledge Search / Apps Script-first実装方針を採用し、2026-08-16にupload上限、audit / actor運用、およびimplementation-first / final live qualification方針へ単純化した。Works 0004–0011は実装・マージ済みで、Work 0012はApps Script公開surfaceとKnowledge Exportのhardeningを完了した。

アプリケーションrelease versionは`0.1.2`、Work IDは実装コンポーネントとhandoffを追跡する別の識別子である。setup/statusの`componentWorkId`と`releaseVersion`を混同しない。

## Current sources of truth

- `product/vision.md`: product purpose / UX
- `architecture/target-architecture.md`: architecture boundaries
- `planning/mvp-and-roadmap.md`: accepted phases / validation / genuine remaining choices
- `planning/apps-script-implementation-plan.md`: setup / Work sequence / acceptance / ChatGPT-Codex routing / live-validation timing
- `operations/runtime-policy.md`: runtime / upload / retry / audit / actor / sync
- `ai/gemini-file-search.md`: File Search / metadata / five modes / citations / AI index
- `governance/security.md`: information handling / credentials / common access boundary / restricted audit
- `decisions/decision-log.md`: consolidated durable decisions
- `decisions/gemini-file-search-retrieval.md`: Gemini retrieval decision
- `decisions/apps-script-first-implementation.md`: Apps Script-first delivery decision
- `decisions/pitchbook-upload-limits.md`: 25MB/file, 10 files, 100MB total
- `decisions/audit-access-and-user-attribution.md`: best-effort Actor / separate Restricted Audit Spreadsheet
- `decisions/implementation-first-final-live-qualification.md`: feature implementation first; standard live qualification only after feature freeze

## Authority / conflict handling

1. latest explicit user decision
2. closest domain-specific source
3. current planning / architecture documents
4. historical wording

Current domain authority:

- implementation / setup / validation timing: `planning/apps-script-implementation-plan.md`
- runtime / audit / actor: `operations/runtime-policy.md`
- retrieval: `ai/gemini-file-search.md`
- security: `governance/security.md`
- upload limits: `decisions/pitchbook-upload-limits.md`
- actor / audit access: `decisions/audit-access-and-user-attribution.md`
- live qualification timing: `decisions/implementation-first-final-live-qualification.md`

Older wording that still states `100MB/file`, `500MB/batch`, mandatory persistent user identity, mandatory Web App Audit Viewer, or routine per-Work live validation is superseded and must not be restored.

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
- Works 0004–0009 prioritize implementation + local/static/mock/contract tests
- Work 0010 is the standard DEV live qualification cycle; its browser/Gemini/Shared Drive observations remain environment-dependent
- Work 0011 is the Gemini-independent Knowledge Export and external-AI prompt handoff
- Work 0012 is the public-surface security hardening, safe-error, link-integrity, and deterministic regression work

## Implementation Works

- 0004: scaffold + setup engine + local foundation
- 0005: Meeting feature implementation
- 0006: Pitchbook feature implementation
- 0007: Masters / audit / concurrency + Phase 1 code-complete
- 0008: File Search client / sync engine / 自由質問 implementation with mocks
- 0009: six formats / EML / four presets + feature freeze
- 0010: final DEV live qualification + observed-defect remediation + production readiness
- 0011: Gemini-independent Knowledge Export, Google Docs/PDF output, prompt handoff, setup migration, and metadata-only Audit
- 0012: explicit normal-user facade, private internal Apps Script functions, trigger migration, export bounds/link integrity, safe errors, and regression enforcement

詳細は`planning/apps-script-implementation-plan.md`を参照する。

## Validation timing

開発中は原則としてlocal / static / mock / contract validationだけを行う。Apps Script deployment、Shared Drive live write、Gemini live indexing/query、trigger live validation等はfeature-complete後のWork 0010–0011 qualificationへ集約する。Work 0012の決定論的hardeningは完了しているが、実機での権限等価性・リンク挙動・Gemini qualificationを完了したとは扱わない。

公式仕様・mock・contract testだけでは解消できず、実装継続を妨げるBLOCKERがある場合だけ最小限のlive probeを前倒しできる。

## Operating documents

- `repository-initialization.md`
- `handoff-template.md`
- `handoffs/`
- `core-rules-changelog.md`

Operating documents are not product specifications and do not override current domain-specific sources.
