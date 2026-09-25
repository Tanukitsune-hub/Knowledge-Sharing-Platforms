# Alternative Assets Intelligence

面談メモ、保存資料、ニュース、評価（ICメモ、社内整理等）をGoogle Workspaceに正本として蓄積し、検索・整理・比較・面談準備へつなげるApps Script-firstのナレッジ基盤です。

## Status

Work0070 CODEX-01は4-source record layerをschema9へ拡張するrepository source実装です。target-runtime qualificationは別DispatchのCODEX-02に予定しています。既存のMeeting/Pitchbook、Masters、Restricted Audit、Knowledge Export等を維持します。

個人/synthetic環境で得たevidenceは、会社Shared Drive、real users、confidential data、production Gemini billing、scheduled triggersを含むproduction readinessを意味しません。

## Product direction

通常利用者は1つのApps Script HTML Service Web Appを利用します。

```text
Apps Script Web App
  ├─ 記録を追加: 面談メモ / 資料保存 / ニュース / 評価（ICメモ、社内整理等）
  ├─ 過去の記録: 同じ4 sourceの検索 / 詳細 / 編集 / lifecycle
  ├─ GP / Entity Workspace
  ├─ Activity Analytics
  ├─ Relationship Explorer
  ├─ Knowledge Search
  │    └─ 自由質問 / 要約 / 時系列 / 比較 / 面談準備
  └─ Master Management
```

Backend/Audit/File Searchは通常利用者が直接操作しません。

## Authoritative storage

```text
記録・資料
├─ 面談記録
├─ 保存資料
├─ ニュース
└─ 評価（ICメモ、社内整理等）
```

MeetingのGoogle Doc、保存資料の元file、News/Assessmentの直接入力Docまたはupload原本が正本です。File SearchとKnowledge Exportはderived/rebuildableです。

schema9のBackendはexactly 7 sheetです:

```text
Counterparty_Master
Option_Master
Meeting_Index
Pitchbook_Index
News_Index
Internal_Assessment_Index
Settings
```

Audit is a separate Restricted Spreadsheet.

## Meeting model

現在の面談required fieldsはDate、Counterparty、Asset Classです。Team、Fund/Strategy、Meeting Type、Related Pitchbooks、follow-up、person/role text、internal participants、body notesはoptionalです。

Work0016で定めたCounterparty分類は、後続のschema8で汎用`Counterparty_Master`と`CP-*` identityへ統合されました:

```text
Counterparty Type
  -> Counterparty Entity
```

Categories:

```text
GP / 運用会社
LP / Asset Owner
日本生命
グループ会社
Consultant / Gatekeeper
その他
```

- GPは`Counterparty_Type=GP`として同じ`Counterparty_Master`に保持します。
- 旧`GP_Master`とnon-GP option fieldはmigration互換として扱います。
- The existing free-text person field remains and is clarified as `面談相手（氏名・役職）`.
- Legacy GP Meetings retain stable IDs/Docs/files.
- Non-GP Meetings may retain relevant manager context through `Related_GP_IDs`.

Detailed decision:

[Counterparty Entity Classification](docs/decisions/counterparty-entity-classification.md)

## Pitchbook model

保存資料はMeeting関連付けあり・なしの両方を同じ`DOC-` / `Pitchbook_Index`で扱います。

- required: file, Date, Counterparty, Asset Class;
- optional: Equity/Debt, Fund/Strategy;
- stable Document ID / Batch ID / Drive File ID;
- sequence starts at `_01` and continues from destination max;
- file-granular partial success and idempotent retry;
- 25MB/file, 10 files/selection, 100MB total.

Newsと評価（ICメモ、社内整理等）は、各々のstable IDとIndex sheetを持ちます。直接入力はGoogle Doc、uploadは1件の原本fileを正本とし、複数Counterpartyをcanonical `Counterparty_IDs`に保存します。AI indexing / retrieval、Full Output 4-source化、DigestはWork0070の対象外です。

## Relationships and workspaces

- Work 0015: GP Workspace / browser-native print brief.
- Work 0018: bidirectional Meeting ↔ Pitchbook Relationship Explorer.
- Work 0019: Entity Workspace and exact Fund/Strategy drill-down.

Canonical relationship remains `Meeting_Index.Related_Pitchbook_IDs`. There is no relation sheet and no automatic relationship inference.

## Activity analytics

After Counterparty Entity foundation, Work 0017 adds:

- monthly / quarter / year / fiscal year / custom range / cumulative Meeting activity;
- Counterparty, Related GP, Asset Class, Team, Meeting Type, and Status slices;
- exact underlying Meeting lists;
- one narrow monthly administrative completion check.

## Gemini knowledge retrieval

```text
Google Workspace source
  -> isolated File Search Store
  -> stable metadata + semantic retrieval
  -> configured Gemini Flash
  -> grounded output + citations + Drive links
```

Accepted initial formats:

```text
.pdf / .pptx / .xlsx / .docx / .txt / .eml
```

Work 0020 qualifies the personal-PC core with synthetic/non-confidential data. Work 0021 adds structured filters, all five modes, and 2–5 entity comparison.

A separate static GP-comparison dashboard is not planned: numeric comparison belongs to analytics, qualitative comparison belongs to Gemini.

## Historical material migration

Historical files are highly heterogeneous. Manual entry is a valid default.

After personal-PC Gemini qualification, choose among:

```text
manual
hybrid/manual-assisted
selective automation for repeatable subsets
```

A universal converter is not required.

## Roadmap

```text
0015 GP Workspace
→ 0016 Counterparty entity foundation
→ 0017 analytics / monthly checks
→ 0018 Relationship Explorer
→ 0019 Entity Workspace / Fund-Strategy drill-down
→ 0020 personal-PC Gemini/File Search core
→ 0021 structured filters / multi-entity comparison
→ historical migration
→ final production qualification
```

Detailed roadmap:

[Planning Baseline and Roadmap](docs/planning/mvp-and-roadmap.md)

## Development policy

```text
bounded preflight
→ shortest coherent production-source vertical slice
→ actual Apps Script / Workspace / Web App target runtime
→ isolated synthetic/anonymized data/resources
→ guarded side effects
→ focused LOGIC_VALIDATION
→ bounded TARGET_RUNTIME_QUALIFICATION
→ expand after native readback
→ separately authorize production data/users/billing/triggers/destructive effects
```

Report separately:

```text
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
READY
```

Mocks, CI, test loaders, and alternate runtimes prove only what they exercised.

## Validation commands

```text
npm run check
git diff --check
python tools/validate_agent_foundation.py
```

## Documentation

- [Documentation index](docs/README.md)
- [Product Vision](docs/product/vision.md)
- [Target Architecture](docs/architecture/target-architecture.md)
- [Roadmap](docs/planning/mvp-and-roadmap.md)
- [Implementation Plan](docs/planning/apps-script-implementation-plan.md)
- [Counterparty Entity Decision](docs/decisions/counterparty-entity-classification.md)
- [Gemini File Search](docs/ai/gemini-file-search.md)
- [Decision Log](docs/decisions/decision-log.md)
- [Security](docs/governance/security.md)

## Repository data policy

GitHub stores design, production source code, and synthetic/anonymized test data only. Do not commit real Meeting records, Pitchbooks, personal information, non-public deal information, credentials, organization-specific IDs, private URLs, deployment IDs, or local machine mappings.
