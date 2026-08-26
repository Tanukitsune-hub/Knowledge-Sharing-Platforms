# Knowledge Sharing Platforms

プライベートアセット領域のMeeting recordsとPitchbook / source materialsを、少ない運用負荷で蓄積し、検索・整理・要約・比較できるようにするGoogle Workspace / Apps Script-firstのナレッジ基盤です。

## Status

Meeting / Pitchbook登録・maintenance、Masters、Audit、Gemini File Search foundation、5モードKnowledge Search、Knowledge Export、Apps Script public-surface hardening等のproduction sourceはGitHubで管理されています。

Active Work 0014 / PR #17はstructured Meeting/Pitchbook context foundationとbounded repairを扱っています。このWorkは既存のevidence boundaryで完了または安全停止し、その後の新規Workから2026-08-26のTarget-Runtime-First policyを標準適用します。

本READMEはproduction rollout、production data投入、real-user access、Gemini billing、trigger enablement、permission qualificationの完了を意味しません。

## Development policy

別DEV runtimeを先に完成させてから本番へ移植することを標準としません。

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

Target runtimeとproduction data / rolloutは別です。実際のApps Script / Workspace behaviorを早期に確認しつつ、confidential data、real users、billing、triggers、public exposure、physical delete、bulk mutation、migration、permission changesは個別にguardします。

Separate DEV/Stagingは、対象runtime内のresource isolationやfeature/side-effect guardでは得られないmaterial safety、regulatory、blast-radius、rollback、concurrency、scale、cost、またはplatform evidenceがある場合だけ採用します。

Report separately:

```text
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
READY
```

CI、mock、simulator、alternate runtime、synthetic harness、test loaderだけのPASSは、Apps Script / Workspace / browser / Gemini readinessではありません。

Detailed decision: [Target-Runtime-First Development](docs/decisions/target-runtime-first-development.md)

## Product overview

```text
Authorized users
      |
      v
Apps Script HTML Service Web App
  ├─ Meeting: New / Past
  ├─ Pitchbook: New / Past
  ├─ Knowledge Search
  │    └─ 自由質問 / 要約 / 時系列 / 比較 / 面談準備
  └─ Master Management
      |
      v
Google Apps Script V8
      |
 +----+------------------------------+
 |                                   |
 v                                   v
Backend Spreadsheet             Google Shared Drive
5 baseline sheets               authoritative sources
                                     |
                                     v
                              Gemini File Search
                                     |
                                     v
                              Gemini Flash
                                     |
                                     v
                        grounded output + citations

Separate Restricted Audit Spreadsheet
```

## Authoritative storage

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

Shared Drive source folders remain simple and authoritative. Gemini File Search is derived and rebuildable.

Backend baseline:

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

Schema evolution is append-only where practical. Stable IDs are used instead of row numbers. Normal users do not directly edit backend / Audit / File Search resources.

## Meeting records

Required baseline:

- Date
- GP
- Asset Class

Optional baseline:

- Time
- Location
- Equity / Debt
- Counterparty
- Internal Participants
- Notes

Meeting body is authoritative in Google Docs and is not duplicated into `Meeting_Index`.

Fixed ID example:

```text
MTG-000123
```

Filename:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Time is excluded. Optional segments are omitted when absent. Later accepted structured fields and relationships use append-only schema evolution and stable IDs.

## Pitchbooks / source materials

- drag & drop / multiple files
- required: file, Date, GP, Asset Class
- optional baseline: Equity / Debt
- 25MB/file
- maximum 10 files per selection
- maximum 100MB total per selection
- stable Document ID / Batch ID
- sequence starts at `_01` and continues from destination maximum
- file-granular partial success and idempotent retry

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

If actual Apps Script behavior requires a lower safe upload limit, lower the limit before adding complex transport architecture.

## Masters / drafts / maintenance

- GP: immutable ID, mutable display name, Active/Inactive, quick-add with normalized duplicate check
- Option Master: stable IDs, Sort Order, Active/Inactive
- authorized users may add / rename / reorder / deactivate / reactivate allowed Masters
- shared browser context for accepted common Meeting/Pitchbook fields
- text / selection drafts retained for 24h in the same browser
- past-record filters use stable IDs where applicable
- logical Active / Inactive / Reactivate rather than normal-user physical deletion
- Meeting concurrent edits use Version / Updated At optimistic locking
- LockService is limited to short consistency-critical sections

## Audit model

Audit logs are stored in a separate Google Spreadsheet under a Restricted admin-only control folder.

Initial Web App does not require an Audit Viewer or custom password screen. Drive sharing permissions are the access boundary.

Actor attribution is best-effort:

1. email when safely available;
2. `TEMP_USER:<temporary active user key>` when available;
3. `UNIDENTIFIED`.

Missing persistent personal identification must not block normal operations. Audit is operational trace, change history, AI-use trace, and failure-investigation evidence—not strict non-repudiation.

Audit retention: five years.

## Gemini knowledge retrieval

```text
Shared Drive = authoritative source
Sheets       = exact metadata / index
File Search  = rebuildable semantic index
Gemini Flash = grounded synthesis
```

Accepted baseline:

- one Gemini File Search Store initially
- exact filtering through Custom Metadata
- semantic retrieval through File Search-managed embeddings
- no custom Vector DB / embedding pipeline / tag taxonomy / Knowledge Graph initially
- authorized Web App users share access to Active indexed sources
- one configured Gemini Flash model when approved
- bounded Apps Script AI sync worker
- AI failure never rolls back authoritative source capture
- citations return users to the correct Drive source

Initial AI-searchable formats:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

`.eml` original remains in Drive; normalized Subject / From / To / Cc / Date / Body is indexed. Embedded attachments are not automatically indexed. `.msg` is initially out of scope.

Billing-enabled Gemini/File Search operation and confidential source indexing require explicit authorization.

## Knowledge Search target UX

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

`自由質問` is default. All modes share one File Search / metadata / semantic retrieval / Gemini Flash / citation path. Presets change prompt/output template only. Insufficient evidence must be stated rather than invented.

## Knowledge Export / external-AI handoff

- only Active Backend Index rows are eligible;
- Meeting uses authoritative Google Doc text;
- Pitchbook body is not duplicated; metadata and authoritative Drive link are exported;
- server-side count/character limits stop oversized exports before unnecessary Meeting Doc reads;
- Google Docs / PDF are derived copies under the configured Knowledge Exports folder;
- links are bound to stable file IDs and written as explicit Docs hyperlinks;
- provider-neutral five-mode prompts use Master display names plus stable IDs;
- prompt text, source bodies, answers, chunks, embeddings, and bytes are excluded from Audit;
- permission equivalence and retention/deletion behavior require target-runtime evidence before production rollout.

## Apps Script setup and public surface

Editor-only/private setup functions:

```text
setupKnowledgePlatform_()
validateInstallation_()
getInstallationStatus_()
```

Setup is idempotent create / reuse / migration / repair. It manages knowledge folders, backend/Audit resources, baseline sheets, seeds, Settings/schema, and authorized triggers. It is not exposed through `google.script.run`.

Only the canonical normal-user facade is top-level/browser-callable. Setup, status, validation, retention, manual sync, diagnostics, trigger handlers, raw adapters, and destructive helpers remain private.

Production business behavior must exist in production source. Test loaders may not inject missing production-named helpers and then treat the harness PASS as native readiness.

## Validation commands

```text
npm run check
git diff --check
python tools/validate_agent_foundation.py
```

Run targeted deterministic tests first. Run the canonical suite when change risk justifies it. Then obtain the smallest native Apps Script / Workspace / browser / Gemini evidence that local tests cannot prove.

## Work control

- Work ID tracks one stable outcome/theme.
- Each distinct Codex execution request receives `<WORK_ID>-CODEX-<NN>`.
- `BALL` and `STATUS` are tracked in the Work dispatch register and PR body.
- Active Work state belongs in handoffs/PRs, not root AGENTS or this README.

See:

- [Work Control](docs/agent-governance/work-control.md)
- [Dispatch Control](docs/agent-governance/dispatch-control.md)
- [Handoff Template](docs/handoff-template.md)

## Design principles

1. Keep authoritative storage simple.
2. Separate source of truth from AI index.
3. Use metadata for exact filters and embeddings for semantic search.
4. Trace AI output back to source.
5. Do not let AI failure stop source capture.
6. Prove the actual target runtime early with the shortest coherent slice.
7. Isolate test data/resources and guard effects rather than maintaining a drifting parallel environment by default.
8. Do not add architecture merely to preserve arbitrary limits or theoretical future needs.

## Documentation

- [Documentation index](docs/README.md)
- [Product Vision](docs/product/vision.md)
- [Target Architecture](docs/architecture/target-architecture.md)
- [Apps Script Implementation Plan](docs/planning/apps-script-implementation-plan.md)
- [Runtime Policy](docs/operations/runtime-policy.md)
- [Target-Runtime-First Decision](docs/decisions/target-runtime-first-development.md)
- [Decision Log](docs/decisions/decision-log.md)
- [Gemini File Search](docs/ai/gemini-file-search.md)
- [Security](docs/governance/security.md)
- [Audit / Actor Decision](docs/decisions/audit-access-and-user-attribution.md)
- [Upload Limit Decision](docs/decisions/pitchbook-upload-limits.md)
- [Work Control](docs/agent-governance/work-control.md)
- [Dispatch Control](docs/agent-governance/dispatch-control.md)

## Repository data policy

GitHub stores design, production source code, and synthetic/anonymized test data only. Do not commit real Meeting records, Pitchbooks, personal information, non-public deal information, API keys, credentials, organization-specific IDs, deployment IDs, private URLs, or local machine mappings.
