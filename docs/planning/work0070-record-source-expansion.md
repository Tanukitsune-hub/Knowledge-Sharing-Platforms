# Work 0070 — Source-aware record layer expansion

WORK_ID: 0070
MODE: BUILD
VALIDATION_TIER: TIER_3_HIGH
STATUS: READY
ROUTE: C

Current as of: 2026-09-25

## Primary Outcome

API providerに依存せず、Alternative Assets Intelligenceで以下4つのsourceをチーム利用前提で登録・保存・検索・閲覧・編集できるauthoritative record layerを完成させる。

```text
面談メモ
保存資料
ニュース
評価（ICメモ、社内整理等）
```

Work0069で閉じたproduct decisionを実装へ落とすWorkであり、AI retrieval / Full Output 4-source化 / Digest生成は後続Workとする。

## Source of Truth

優先順:

1. ユーザー明示指示
2. `docs/planning/work0069-source-aware-knowledge-expansion-plan.md`
3. `docs/product/source-aware-knowledge-expansion.md`
4. このWorkのhandoff / dispatch register
5. nearest `AGENTS.md`
6. current `main`

Work0069のClosed Decisionsは重大な反証がない限り再検討しない。

## Task-specific architecture exception

current root `AGENTS.md`には5-sheet baseline / no sixth storage layerが残っているが、Work0069の明示決定によりWork0070はそのcurrent baselineをschema9 / 7 sheetsへ置き換えることを許可する。

Target Backend:

```text
Counterparty_Master
Option_Master
Meeting_Index
Pitchbook_Index
News_Index
Internal_Assessment_Index
Settings
```

Restricted Audit Spreadsheetは別resourceのまま。

production sourceがschema9へ切り替わるPRでは、同じchange set内でroot `AGENTS.md`、target architecture、current product docsの反復ルールを新baselineへ更新する。historical Work evidenceは書き換えない。

## Closed Product Contract

### Product / Drive naming

- user-visible product title: `Alternative Assets Intelligence`
- authoritative source root: `記録・資料`
- direct children:
  - `面談記録`
  - `保存資料`
  - `ニュース`
  - `評価（ICメモ、社内整理等）`
- existing exact legacy names are renamed in-place by stored ID:
  - `Private Assets Knowledge` -> `記録・資料`
  - `Meeting Records` -> `面談記録`
  - `Pitchbooks` -> `保存資料`
- manually customized names are preserved; do not force-rename them.
- no file move/copy merely for naming.
- `Knowledge Exports` remains outside the authoritative source root.

### Stable IDs

- Meeting: existing `MTG-`
- Pitchbook: existing `DOC-`
- News: `NEWS-000001`
- Internal Assessment: `ASMT-000001`
- News / Assessment use independent monotonic counters in Settings with short ScriptLock allocation.
- semantic duplicates are not auto-merged.

### Record navigation

`記録を追加`:

```text
面談メモ | 資料保存 | ニュース | 評価（ICメモ、社内整理等）
```

`過去の記録`:

```text
面談メモ | 保存資料 | ニュース | 評価（ICメモ、社内整理等）
```

- Add / Past selected-tab states are independent.
- both default to 面談メモ.
- 390px viewport must not gain horizontal overflow from the long assessment label.

### Registration state

Shared normal-user fields:

```text
date
assetClassId
fundStrategy
```

- hidden existing `capitalTypeId` stays internal/preserved; do not re-expose it.
- first open / browser reload / new session = clear normal input state.
- remove the 24h silent draft restore behavior.
- shared fields persist across Add-page tab changes and successful record saves until explicit global `クリア`.
- source-specific unsaved fields are independent by tab.
- successful save clears only the active tab's source-specific inputs / selected files; shared fields and other tabs' unsaved source-specific inputs remain.
- global `クリア` clears shared fields plus unsaved inputs / selected files across all 4 Add tabs.
- do not remove retry / unknown-outcome / partial-upload recovery state. If such safety state is unresolved, global clear must fail closed until recovery is resolved.
- normal unsaved input state must be browser-tab/session-local; no cross-tab localStorage sharing.

### Pitchbook / 保存資料

Meeting tab keeps current related-material upload.

Standalone `資料保存` uses the same canonical Pitchbook / `DOC-` / Drive / `Pitchbook_Index` contract, but Meeting parent is optional.

- Meeting path: save Pitchbook + relation to Meeting.
- standalone path: save Pitchbook with no parent Meeting required.
- do not create a second material record type.
- `過去の記録 > 保存資料` shows both Meeting-linked and standalone Pitchbooks.

### Common uploader contract

All upload surfaces use one shared extension/MIME contract:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

Applies to:

- Meeting related files
- standalone 資料保存
- News upload
- Assessment upload

Source of truth should be one server/shared format registry; browser accept/help/validation should derive from it rather than duplicate literals where practical.

Current Pitchbook size/count behavior must not regress unless a concrete Apps Script constraint requires an explicitly documented narrower limit.

### News

Two input routes:

```text
DIRECT_TEXT
UPLOAD_FILE
```

Required:

- Published_Date
- Publisher
- Title
- >=1 Counterparty
- exactly one authoritative content route

Optional:

- URL
- Asset Class
- Fund / Strategy

DIRECT_TEXT creates an authoritative Google Doc in `ニュース`.
UPLOAD_FILE stores one authoritative original in `ニュース`.

Initial `News_Index` schema is fixed by Work0069 and must be implemented without semantic substitution.

### 評価（ICメモ、社内整理等）

Canonical Source Type: `Internal Assessment`.

Two input routes:

```text
DIRECT_TEXT
UPLOAD_FILE
```

Required:

- Assessment_Date
- Assessment_Type
- Title
- >=1 Counterparty
- exactly one authoritative content route

Optional:

- Asset Class
- Fund / Strategy
- Decision / Action
- related Meeting / Document / News IDs

DIRECT_TEXT creates an authoritative Google Doc in `評価（ICメモ、社内整理等）`.
UPLOAD_FILE stores one authoritative original in that folder.

Initial Assessment Type choices should implement stable English codes behind Japanese labels for:

- IC / 投資判断
- ネガティブニュース・不祥事
- CV / 案件見送り
- GP / Fund評価
- その他社内整理

Do not implement Digest generation in this Work.

### Multi-Entity persistence

News / Assessment require one or more Counterparty IDs.

Persist authoritative relation as sorted / unique comma-separated canonical `Counterparty_IDs` containing stable `CP-*` values.

- one source row/file per source
- no duplication per Entity
- read model normalizes to arrays
- validate every referenced Counterparty against current active/allowed master policy at commit time

### Lifecycle / past-record management

New source types follow:

```text
Active -> Inactive -> Reactivate
```

Normal users do not physically delete authoritative content.

`過去の記録` must provide source-specific search, list, detail, authoritative-source link, metadata edit, and lifecycle action.

DIRECT_TEXT body can be edited with authoritative Google Doc update under optimistic concurrency.
UPLOAD_FILE original bytes are not replaced in initial Work; metadata edit only.

Admin deleted-record management / restore must include News and Assessment consistently with existing lifecycle policy.

### Team / concurrency behavior

This is a multi-user business system.

- different-record creates may proceed concurrently.
- global ScriptLock only around short shared-state critical sections such as counters / row reservation / atomic commit.
- never hold global lock while uploading bytes, writing long Docs, AI/provider work, or other long processing.
- same-record edit uses claim + optimistic concurrency / CAS; stale writer fails closed.
- server revalidates current master/reference state at commit.
- one user's clear/input state must not affect another user or another browser tab.
- authoritative save success is not rolled back by Audit or future derived processing failure.

### Release / package

Default target:

- release `0.2.0`
- schema `9`

Update reproducible generated bundle and `dist/company-multifile/` package from `src/`; never hand-edit generated artifacts.

## Work-level Acceptance Evidence

Work0070 is not ACCEPTED until both deterministic validation and target-runtime qualification pass.

Required end state:

- schema8 -> schema9 in-place migration preserves existing Meeting/Pitchbook IDs, rows, Docs/files, relationships and stored resource IDs.
- second setup/migration run is idempotent.
- Backend has exactly 7 authoritative sheets after migration.
- legacy root/child folder exact names rename in-place with same IDs; custom names preserved; no duplicate roots/children.
- product/browser title = `Alternative Assets Intelligence`.
- Add and Past 4-tab UX works at desktop and 390px with no horizontal overflow.
- 24h draft auto-restore removed; safety recovery state preserved.
- shared-state / save-reset / global-clear behavior matches contract.
- Meeting current create/edit/past/material path does not regress.
- standalone Pitchbook save works without parent while Meeting-linked path remains valid.
- News direct/upload/past/edit/lifecycle/restore works.
- Assessment direct/upload/past/edit/lifecycle/restore works.
- all uploader extensions are consistent.
- News / Assessment multi-Entity readback and validation work.
- near-simultaneous multi-session creates have no ID collision, lost row, cross-session bleed, or duplicate derived reservation.
- same-record concurrent edit rejects stale commit.
- Audit target/source identity remains traceable on best-effort actor policy.
- provider calls = 0; AI sync/provider configuration unchanged.
- no confidential/production data used for qualification.
- generated bundle / 7-file package parity pass.

## Dispatch Strategy

### CODEX-01 — source implementation and deterministic validation

Implement the full production-source change, tests, generated artifacts and documentation on a branch. Do not deploy or mutate any Apps Script/Drive/Sheet target runtime in this dispatch.

Return a Draft PR for ChatGPT review.

### CODEX-02 — source review repair

CODEX-01のChatGPT reviewで確認したdeterministic contract defectsを、PR #103内で限定修正する。

- browser upload acceptのreal bootstrap shape整合
- standalone 保存資料のAsset Class required整合
- News / Assessment text-length client/server整合
- explicit SOURCE_REQUEST_EXPIRED recovery
- new source errorのsafe public message整合

repository-only。target-runtime mutationは0。

### CODEX-03 — isolated target-runtime migration and qualification

CODEX-02のsource repairをChatGPTが受入れた後に作成する。smallest isolated Apps Script / Workspace mutationでschema9 migration、folder identity-preserving rename、persistence、browser behavior、team concurrencyをqualificationする。

No company production migration occurs in Work0070 unless separately authorized.

## Non-Goals

- 4-source Knowledge Search checkbox UI
- 4-source AI retrieval/indexing
- Full Output 4-source materialization/parity
- Internal Assessment Digest
- automatic News crawl/RSS/API
- historical bulk migration
- user-level source ACL
- company production rollout
- API key/provider/billing work
- unrelated UI polish

## Completion Latch

Only after CODEX-03 target-runtime evidence and final ChatGPT review:

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: TEST_ONLY
BLOCKER: NONE
READY: YES
COMPLETION_LATCH: APPLIED
```
