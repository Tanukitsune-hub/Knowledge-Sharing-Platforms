# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-10
ACTIVE_DISPATCH_ID: 0028-CODEX-10
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.14 / RECORD-CENTRIC IA AND KNOWLEDGE SEARCH / DESIGN ONLY

## Current state

CODEX-09 returned Draft PR #46 from `codex/0028-final-light-user-corrections` and remains the accepted Light visual baseline.

- PR: https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/46
- PR head: `400f2f0e77acf81deb32e363d79a3962dfd2f017`
- design artifact: `933111ce96cd170210f80ca7bada862cbdfe310c`
- report: `docs/handoffs/0028-CODEX-09-final-light-user-corrections-report.md`

PR #46 remains the CODEX-09 Light visual baseline. ChatGPT controller technical review for CODEX-09 is PASS; no technical BLOCKER is open.

CODEX-10 returned a fresh design-only package from `codex/0028-codex10-record-centric-design`.

- PR: pending creation after final local validation
- report: `docs/handoffs/0028-CODEX-10-record-centric-design-report.md`
- current scope: Knowledge Search action correction + record-centric add/history surfaces
- production `src/**` / `dist/**`: unchanged

## Accepted CODEX-09 evidence preserved

- 15/15 design pages rendered at 1366×768;
- horizontal overflow 0/15;
- sidebar destinations 7 / active exactly 1;
- browser console warning/error 0;
- Product Design QA actionable P0/P1/P2 = 0;
- `npm run check` 456/456 PASS;
- production `src/**` / `dist/**` changes NONE;
- runtime / deploy / Dark / System / provider / data / auth changes NONE.

Static design evidence does not qualify Apps Script runtime, persistence, authentication, server-side preset resolution, measured contrast, screen-reader behavior, complete keyboard paths or mobile behavior.

## CODEX-10 returned design corrections

Authoritative decisions and returned artifact:

- `docs/handoffs/0028-CODEX-10-knowledge-search-action-corrections.md`
- `docs/handoffs/0028-CODEX-10-record-centric-architecture-decisions.md`
- `docs/handoffs/0028-CODEX-10-record-centric-design-report.md`

The closed decisions below are represented in the CODEX-10 design package. They remain future BUILD requirements; this dispatch did not change production source or runtime.

### Knowledge Search

1. Row 1 first field is `面談先`, not `GP`.
2. `面談先` uses existing Counterparty Entity / `entityKey` semantics across GP / LP / 日本生命 / グループ会社 / Consultant / その他.
3. `全文出力` is removed from the `AIモデル` selector.
4. Action area becomes `検索 / 全文出力 / 条件をクリア`.
5. `全文出力` is Meeting-only / non-AI and exports authoritative Google Docs full text plus authoritative Meeting attributes.

### Record-centric information architecture

The previous dual `面談 / 資料` surface is superseded.

#### `記録を追加`

- remove `面談 / 資料` subtab;
- introduce `記録種別 = 面談 / データ受領`;
- normal Meeting may include optional file upload;
- `データ受領` records a short receipt-background memo plus files;
- no standalone `資料だけ追加` route/action;
- parent record is created first; only after `Meeting_ID` is issued may Pitchbook/file registration begin;
- if parent record creation fails, Pitchbook registration count must remain 0;
- file-level partial failure/retry semantics remain independent from the successful parent record.

#### `過去の記録`

- remove `面談 / 資料` subtab;
- show one record list for record anchors;
- record detail shows related files;
- allow new file upload from an existing record, including later follow-up files;
- user-facing `削除` on a related file means unlink from the current record, not hard delete;
- no independent Pitchbook list and no `資料 → 関連面談` reverse surface.

### Pitchbook eligibility correction

Current production `Pitchbook` registration incorrectly requires `GP_ID`.

Future production eligibility must be based on a valid parent `Meeting_ID`, not GP identity. Any existing Meeting counterparty type may own attached files.

Parent counterparty categories remain:

- GP / 運用会社
- LP / Asset Owner
- 日本生命
- グループ会社
- Consultant / Gatekeeper
- その他

Pitchbook File Search metadata / citation context must preserve non-GP parent context without GP-name inference.

### `データ受領`

A standalone received file is represented as a new record, not as a standalone Pitchbook.

- create a `データ受領` record;
- issue a stable `Meeting_ID`;
- record date / source counterparty / classification / short receipt-background memo;
- upload received files only after the parent ID is committed.

Future BUILD should prefer a minimal `Meeting_Index` schema extension such as `Record_Type = MEETING | DATA_RECEIPT`; existing rows migrate logically to `MEETING`. Do not create a new Record_Index unless source review proves necessary.

### Relationship truth

Prefer preserving `Meeting_Index.Related_Pitchbook_IDs` as the active relationship truth.

Future Pitchbook upload receives a parent `Meeting_ID`, validates the authoritative record, registers files, then adds resulting `Document_ID`s to the parent relationship list. No new relationship table/network model.

## Preserved boundaries

- Work 0027 Gemini qualified-disabled / normal-user hidden;
- Work 0029 shared-admin security behavior;
- Light only; Dark/System/theme selector canceled;
- sidebar `#182124`, active `#E1001F` thin left strip only;
- Knowledge Search continues to support Meeting + Pitchbook File Search sources;
- Pitchbook physical file lifecycle / Document_ID remain separate from Meeting data;
- production implementation and deployment remain unauthorized.

## Dispatch history

| Dispatch ID | Disposition |
|---|---|
| 0028-CODEX-01 | Historical tombstone; never reuse. |
| 0028-CODEX-02 | Historical tombstone; never reuse. |
| 0028-CODEX-03 | A/B/C Light exploration; RETURNED PARTIAL on PR #40. |
| 0028-CODEX-04 | Selected Light family; RETURNED on PR #41. |
| 0028-CODEX-05 | Light refinement; RETURNED on PR #42. |
| 0028-CODEX-06 | Navigation/Workspace consolidation; RETURNED on PR #43. |
| 0028-CODEX-07 | Final Light correction; RETURNED on PR #44. |
| 0028-CODEX-08 | Light-only final polish; RETURNED on PR #45; controller technical review PASS. |
| 0028-CODEX-09 | Final accumulated Light user corrections; RETURNED on PR #46; controller technical review PASS. |
| 0028-CODEX-10 | Knowledge Search and record-centric Light correction; RETURNED on a fresh design-only package. |

## Next gate

Review CODEX-10's Light package and close user Light acceptance. If accepted, apply the Work 0028 Completion Latch before any separate production BUILD request.

CODEX-10 remains DESIGN ONLY. Production BUILD requires a later Strategy Reset plus explicit user authorization. The unresolved external runtime boundaries are not blockers for this design return.

```text
THEME_SCOPE: LIGHT_ONLY
DRAFT_PR_46: CURRENT LIGHT VISUAL BASELINE
CODEX10_PR: PENDING_CREATION
CONTROLLER_TECHNICAL_REVIEW_CODEX_09: PASS
CONTROLLER_TECHNICAL_REVIEW_CODEX_10: PENDING
USER_LIGHT_ACCEPTANCE: PENDING
KNOWLEDGE_PRIMARY_TARGET_LABEL: 面談先
FULL_EXPORT_UI: DEDICATED_BUTTON / NOT_MODEL_OPTION
RECORD_CENTRIC_IA: CLOSED_FOR_CODEX_10
ADD_RECORD_SUBTABS: REMOVED_IN_DESIGN
PAST_RECORD_SUBTABS: REMOVED_IN_DESIGN
RECORD_TYPES: MEETING / DATA_RECEIPT
PITCHBOOK_PARENT_REQUIREMENT: VALID_MEETING_ID
PITCHBOOK_GP_REQUIRED: REMOVE_IN_FUTURE_BUILD
RELATED_FILE_DELETE_UI: UNLINK
STANDALONE_PITCHBOOK_REGISTRATION: REMOVE
NEXT_UNUSED_DISPATCH: 0028-CODEX-11
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-10
BALL: CHATGPT
STATUS: RETURNED
