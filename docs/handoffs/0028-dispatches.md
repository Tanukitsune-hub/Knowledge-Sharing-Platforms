# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-10
ACTIVE_DISPATCH_ID: 0028-CODEX-10
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.14 / KNOWLEDGE SEARCH ACTION CORRECTIONS / DESIGN ONLY

## Current state

CODEX-10 returned a new design-only review package from `codex/0028-knowledge-search-action-corrections`, based on current `origin/main`.

- PR: pending creation after final local validation
- branch: `codex/0028-knowledge-search-action-corrections`
- report: `docs/handoffs/0028-CODEX-10-knowledge-search-action-corrections-report.md`

CODEX-09 remains available as the accepted visual baseline in Draft PR #46.

- PR: https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/46
- PR head: `400f2f0e77acf81deb32e363d79a3962dfd2f017`
- design artifact: `933111ce96cd170210f80ca7bada862cbdfe310c`
- report: `docs/handoffs/0028-CODEX-09-final-light-user-corrections-report.md`

PR #46 is the CODEX-09 historical Light review baseline; CODEX-10 is the current review package.

ChatGPT controller technical review: `TECHNICAL_REVIEW_PASS / USER_LIGHT_ACCEPTANCE_PENDING`.

No technical BLOCKER is open.

## Accepted CODEX-09 technical evidence

- Draft PR #46: open / draft / mergeable / unmerged;
- changed paths: design/docs/report/control files only; production `src/**` / `dist/**` changes NONE;
- 15/15 design pages rendered at 1366×768;
- horizontal overflow 0 / 15;
- sidebar destinations exactly 7; active exactly 1 per page;
- browser console warning/error 0;
- Product Design QA actionable P0/P1/P2 = 0;
- `npm run check`: PASS / 456 of 456;
- design assertions / JS syntax / diff hygiene: PASS;
- GitHub CI status checks: none reported; local validation only;
- runtime / deploy / Dark / System / provider / data / auth changes: NONE.

Static design evidence does not qualify Apps Script runtime, persistence, server-side preset resolution, authentication behavior, measured contrast, screen-reader behavior, complete keyboard paths or mobile behavior.

## Closed user corrections implemented in CODEX-09

### Knowledge Search

- Row 1: `GP / 情報ソース / 開始日 / 終了日 / 全期間`
- Row 2: `検索モード / AIモデル`
- Row 3: wide / larger `質問`
- default rolling 3 years / `全期間` OFF
- information source: `面談記録・資料 / 面談記録のみ / 資料のみ`
- Free Question editable; non-free preset gray readonly; free draft restored
- admin page has search-mode preset design

### 面談実績の集計

Lower Meeting table:
`日付 / 面談先 / Asset Class / Team / 原資料 / 年1回面談 / オフィス訪問 / 年次総会 / 確認済み`

Existing `meetingTypeCodes` map to `○ / —`; `確認済み` remains existing admin-check mapping.

### Visual polish

Sidebar local Lucide/Feather-family SVG uses stronger metallic gold treatment with no new runtime dependency.

## New closed corrections after CODEX-09 return

Authoritative decision:

`docs/handoffs/0028-CODEX-10-knowledge-search-action-corrections.md`

### 1. Knowledge Search `GP` → `面談先`

Primary Row 1 final label/order:

`面談先 / 情報ソース / 開始日 / 終了日 / 全期間`

`面談先` is not GP-only. It must represent existing Counterparty Entity / `entityKey` across GP, LP / Asset Owner, 日本生命, グループ会社, Consultant / Gatekeeper and その他. Do not infer or auto-convert a non-GP counterparty to a GP.

### 2. Full Output becomes a dedicated action

Remove `全文出力（AIを使わない）` from the `AIモデル` selector.

Action area gets an independent `全文出力` button, separate from normal AI search. Preferred action order:

`検索 / 全文出力 / 条件をクリア`

Full Output is Meeting-only / non-AI. It exports authoritative Google Docs full text plus all available authoritative Meeting attributes for matching Active Meeting records. It does not include Pitchbook body or a Pitchbook reference-link section. Meeting-row relationship attributes such as `Related_Pitchbook_IDs` may remain as metadata.

Future BUILD should reuse existing Knowledge Export preview/copy/Google Docs/PDF machinery where practical, but CODEX-10 remains design-only.

## Pending Past Records decision

The user is reviewing the full `過去の記録` specification and is still considering whether to remove the reverse `資料 → 関連面談` presentation while preserving `面談 → 関連資料`.

This reverse-relation removal is NOT CLOSED yet. Do not implement it until the user explicitly confirms the final direction.

Current relationship truth remains `Meeting_Index.Related_Pitchbook_IDs`; relationship mutation remains only in Meeting registration/edit.

## Preserved boundaries

- Work 0027 Gemini qualified-disabled / normal-user hidden;
- Work 0029 shared-admin security behavior;
- Light only; Dark/System/theme selector canceled;
- sidebar `#182124`;
- active `#E1001F` thin left strip only;
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
| 0028-CODEX-10 | Knowledge Search action corrections; RETURNED on a new design-only Draft PR after local validation. |

## Next gate

Review the CODEX-10 Light package and close user Light acceptance. The unresolved Past Records reverse-relation decision remains separate and must not be inferred from this dispatch.

Production BUILD still requires a separate Strategy Reset and explicit user authorization. Do not change `src/**`, `dist/**`, runtime, or deployment within CODEX-10.

```text
THEME_SCOPE: LIGHT_ONLY
DRAFT_PR_46: OPEN / DRAFT / CODEX-09 HISTORICAL LIGHT BASELINE
CODEX10_PR: PENDING_CREATION
CONTROLLER_TECHNICAL_REVIEW_CODEX_09: PASS
CONTROLLER_TECHNICAL_REVIEW_CODEX_10: PENDING
USER_LIGHT_ACCEPTANCE: PENDING
KNOWLEDGE_PRIMARY_TARGET_LABEL: 面談先
FULL_EXPORT_UI: DEDICATED_BUTTON / NOT_MODEL_OPTION
FULL_EXPORT_SOURCE: MEETING_ONLY / NON_AI
PAST_RECORD_REVERSE_RELATION_REMOVAL: USER_CONSIDERING / NOT_CLOSED
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
