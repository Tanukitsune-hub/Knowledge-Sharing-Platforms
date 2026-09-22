# Work 0053 — user-facing Japanese copy naturalization requirements

WORK_ID: 0053
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0052 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

Knowledge Share全体の利用者向け文言を横断レビューし、生成AIの直訳調・技術文書調・不自然な日本語を、短く自然な業務UI日本語へ統一する。

正本:
- `docs/design/ui-japanese-copy-guidelines.md`

## Scope

All user-facing visible text:
- page titles / section headings
- labels / hints
- buttons
- empty states
- loading / success / warning / error messages
- modal text
- admin page text
- Knowledge Search / Full Output
- Maintenance / Entity summary / Analytics
- Theme / Provider settings
- print/PDF user-visible labels where generated from UI copy contracts

## Key corrections

### Remove AI-like / literal-translation wording

Examples to remove or replace:
- 権威ある
- authoritative
- materialize
- canonical
- fail closed
- stale source
- boundary
- contract
- provider response
- Entity / Relationship when natural Japanese exists

Technical terms may remain in developer docs / code / IDs.

### Natural error wording

Replace generic:
- `確認できませんでした`

with operation-specific language:
- `読み込めませんでした`
- `見つかりません`
- `開くことができません`
- `保存できませんでした`
- `更新できませんでした`

Do not over-correct established business/technical terms.

### Terminology consistency

Create and enforce a small glossary for recurring terms, including:
- 面談 / 面談記録
- 保存資料
- 面談先
- アセットクラス
- チーム
- 面談場所
- 最後の面談日
- 削除済み / 復元
- 既定の配色
- 接続確認 / 同期

Keep:
- Meeting ID
- Document ID
- Fund / Strategy
- Status
- OpenAI / Gemini / API
- HEX / RGB

## Preserve behavior

This is copy-only except where a label change requires matching accessibility attributes/tests.

Do NOT:
- change backend contracts
- change IDs / payloads / enums
- change search logic
- change storage
- change permissions
- change UI layout except unavoidable text wrapping corrections

## Review method

1. inventory all user-facing strings in `src/*.html` and public error-message maps in `src/*.gs`
2. classify:
   - natural / keep
   - Japanese but awkward
   - unnecessary English
   - internal technical term exposed
   - overly verbose / defensive
3. rewrite only the latter categories
4. compare terminology across screens
5. browser review at desktop/mobile

## Acceptance Evidence

- visible `権威ある`: 0
- visible `authoritative`: 0
- visible internal-only terminology from guideline avoid-list: 0 unless explicitly excepted
- no material change to Meeting ID / Document ID / Fund / Strategy / Status
- error messages state the actual failed operation
- repeated terms are consistent across pages
- 7 normal pages + admin tabs reviewed
- 1440 / 390 no material layout regression from wording
- console error/warn 0
- business logic diff 0
- backend API/schema/migration/provider/permission change 0

## Non-goals

- marketing copy rewrite
- visual redesign
- translation to English
- code comments / developer docs Japanese cleanup
- raw third-party error translation beyond safe public messages
- Work0030
