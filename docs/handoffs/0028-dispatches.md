# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-08
ACTIVE_DISPATCH_ID: 0028-CODEX-08
BALL: CHATGPT
STATUS: REVIEW
MODE: INVESTIGATION
PHASE: A1.12 / LIGHT-ONLY FINAL USER CORRECTIONS / DESIGN ONLY

## Current state

CODEX-08 returned Draft PR #45 from `codex/0028-light-only-final-polish` at head `2a1843048f76b6a48cec35fcdfe2c5b116c7e3dd`.

PR #45 remains the current Light visual baseline. ChatGPT controller technical review for CODEX-08 is `TECHNICAL_REVIEW_PASS`, but user visual acceptance is not complete because additional bounded Light corrections have been requested for:

- `面談実績の集計` lower Meeting table;
- stronger metallic-gold sidebar icons;
- Knowledge Search information-source wording;
- Knowledge Search primary-condition layout;
- admin-managed search-mode preset design.

No technical BLOCKER is open.

## Accepted CODEX-08 evidence preserved

- 14/14 design pages render;
- 1366×768 horizontal overflow 0/14;
- 7 sidebar destinations / active exactly 1;
- standalone Relationship Explorer removed and Past Records relationship views integrated;
- system/tool separator and current metallic gold treatment accepted as baseline only;
- Product Design QA P0/P1/P2 = 0;
- browser console warning/error 0;
- `npm run check` PASS / 456;
- production `src/**` / `dist/**` changes NONE;
- runtime / deploy / Dark / System NONE.

## Closed user corrections queued for CODEX-09

Authoritative decisions:

- `docs/handoffs/0028-CODEX-09-analytics-meeting-type-columns-decisions.md`
- `docs/handoffs/0028-CODEX-09-knowledge-search-layout-and-mode-policy-decisions.md`

### 1. 面談実績の集計 — individual Meeting table

Final visible columns:

1. 日付
2. 面談先
3. Asset Class
4. Team
5. 原資料
6. 年1回面談
7. オフィス訪問
8. 年次総会
9. 確認済み

Meeting Type columns show `○` / `—` from existing `meetingTypeCodes`:

- `ANNUAL_REVIEW` → 年1回面談
- `OFFICE_VISIT` → オフィス訪問
- `ANNUAL_GENERAL_MEETING` → 年次総会

Multiple `○` in one row are valid. `Fund / Strategy` is removed from this specific monthly admin-review table only. `確認済み` remains rightmost with existing `adminCheckCompleted` / `updateMeetingAdminCheck` mapping.

### 2. Sidebar gold icons

PR #45より明確に強いgold metallic presenceへ引き上げる。Bright highlight + rich gold + antique shadow、gradient / duotone / subtle drop shadowを許可する。必要ならpermissive-licenseの外部icon familyをlocal vendorしてよい。Runtime CDN / remote fetchは禁止。

### 3. Knowledge Search — information source

User-facing label: `情報ソース`

Options:

- `面談記録・資料` → Meeting + Pitchbook
- `面談記録のみ` → Meeting
- `資料のみ` → Pitchbook

通常AI検索の既存File Search / provider filter / citation / source identityは維持する。

`全文出力（AIを使わない）`は`面談記録のみ`に固定し、Pitchbook本文・Pitchbook参照リンクを含めない。

### 4. Knowledge Search — primary layout

Primary search card is three rows:

Row 1:
`GP / 情報ソース / 開始日 / 終了日 / 全期間`

Default period is rolling 3 years: dateFrom = 3 years before current date, dateTo = current date, `全期間` OFF. `全期間` ON disables/removes date filtering.

Row 2:
`検索モード / AIモデル`

Current user-facing `使用モデル` label is renamed to `AIモデル`. Normal-user Thinking remains hidden.

Row 3:
wide / larger `質問` textarea.

### 5. Search mode preset design

Current production five modes are fixed source contracts and the current admin page does not manage search-mode choices. The user now explicitly requires a new future production behavior:

- `自由質問` remains editable and protected;
- non-free modes show an admin-defined fixed prompt in muted gray read-only textarea;
- admin page gets `検索モード設定` design;
- admin can add generic preset modes, disable/remove them from normal-user visibility, edit display name, fixed prompt and sort order;
- existing `比較` and `面談準備` special validation/behavior must not be lost;
- new arbitrary admin modes default to generic fixed-prompt behavior rather than inventing new special validation semantics.

CODEX-09 remains design-only. Production implementation of admin-managed mode persistence / server-side canonical prompt resolution requires a later BUILD Strategy Reset. Client-only readonly is not sufficient; future production must resolve non-free preset prompt authoritatively on the server.

## Preserved Light-only direction

- production start surface: `ナレッジ検索`;
- sidebar destinations exactly 7;
- Light only; Dark/System/theme selector/persistence canceled;
- sidebar `#182124`, active `#E1001F` left strip only;
- Past Records relationship integration preserved;
- Work 0027 Gemini qualified-disabled / normal-user hidden preserved;
- Work 0029 shared-admin behavior preserved;
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
| 0028-CODEX-08 | Light-only final polish; RETURNED on PR #45; controller technical review PASS; further user corrections requested. |

## Next gate

If the user asks to execute the accumulated corrections, allocate fresh Dispatch ID `0028-CODEX-09`; do not reuse CODEX-08.

CODEX-09 remains design-only and must update the current Light review target with the bounded corrections plus screenshot / validation evidence. No production `src/**` / `dist/**`, runtime, deploy, Dark/System changes.

```text
THEME_SCOPE: LIGHT_ONLY
DRAFT_PR_45: CURRENT LIGHT BASELINE
CONTROLLER_TECHNICAL_REVIEW_CODEX_08: PASS
USER_LIGHT_ACCEPTANCE: PENDING
ANALYTICS_MEETING_TYPE_COLUMNS: REQUIRED_NEXT_CORRECTION
KNOWLEDGE_SEARCH_LAYOUT: REQUIRED_NEXT_CORRECTION
KNOWLEDGE_MODE_ADMIN_PRESET_DESIGN: REQUIRED_NEXT_CORRECTION
KNOWLEDGE_MODE_ADMIN_PRESET_PRODUCTION: FUTURE_BUILD_ONLY
INFORMATION_SOURCE_LABEL: 情報ソース
FULL_EXPORT_SOURCE: MEETING_ONLY
SIDEBAR_GOLD_ICON_STRENGTHENING: REQUIRED_NEXT_CORRECTION
NEXT_UNUSED_DISPATCH: 0028-CODEX-09
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-08
BALL: CHATGPT
STATUS: REVIEW
