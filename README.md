# Knowledge Sharing Platforms

プライベートアセット領域のMeeting recordsとPitchbook / source materialsを、Google Workspaceを正本として蓄積し、検索・整理・比較・面談準備へつなげるApps Script-firstのナレッジ基盤です。

## Status

Works 0004–0014はmainへ統合済みです。Meeting/Pitchbook登録・maintenance、Masters、Restricted Audit、Knowledge Export、構造化Meeting context等が実装されています。

Work 0015はGP Workspace / one-page summaryをDraft PR #20で進めています。

個人/synthetic環境で得たevidenceは、会社Shared Drive、real users、confidential data、production Gemini billing、scheduled triggersを含むproduction readinessを意味しません。

## Product direction

通常利用者は1つのApps Script HTML Service Web Appを利用します。

```text
Apps Script Web App
  ├─ Meeting: New / Past
  ├─ Pitchbook: New / Past
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
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

Meeting Google Docと元Pitchbook/source fileが正本です。Gemini File SearchとKnowledge Exportはderived/rebuildableです。

Backend remains exactly five sheets:

```text
GP_Master
Option_Master
Meeting_Index
Pitchbook_Index
Settings
```

Audit is a separate Restricted Spreadsheet.

## Meeting model

Current accepted structured fields include Date, GP, Asset Class, Team, Fund/Strategy, Meeting Type, Related Pitchbooks, follow-up, person/role text, internal participants, and body notes.

Work 0016 prospectively replaces the global GP requirement with:

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

- GP entities use `GP_Master`.
- Non-GP entities use category-specific `Option_Master` Types.
- The existing free-text person field remains and is clarified as `面談相手（氏名・役職）`.
- Legacy GP Meetings retain stable IDs/Docs/files.
- Non-GP Meetings may retain relevant manager context through `Related_GP_IDs`.

Detailed decision:

[Counterparty Entity Classification](docs/decisions/counterparty-entity-classification.md)

## Pitchbook model

Pitchbooks remain GP-oriented for the selected roadmap.

- required: file, Date, GP, Asset Class;
- optional: Equity/Debt, Fund/Strategy;
- stable Document ID / Batch ID / Drive File ID;
- sequence starts at `_01` and continues from destination max;
- file-granular partial success and idempotent retry;
- 25MB/file, 10 files/selection, 100MB total.

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
