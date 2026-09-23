# Work 0052 — missing source graceful failure requirements

WORK_ID: 0052
STATUS: ACCEPTED
MODE: BUILD
BASELINE: Work0051 version33
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

登録後に利用者がMeeting Google DocまたはPitchbook原本をDrive上で削除・Trash・アクセス不能にした場合、Knowledge Search / Full Outputが壊れた参照元を根拠として結果を表示せず、ページ内に短いエラーメッセージを表示して安全に停止する。

Popup / modalは使わない。自動復旧・自動再作成・backend record削除もしない。

## Current confirmed behavior

### Full Output / Knowledge Export

Current implementation already:
- Meeting Doc read failureをcatch
- Pitchbook metadata missing/invalidをcatch
- safe public error code/messageへ変換

Example codes:
- `KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED`
- `KNOWLEDGE_EXPORT_PITCHBOOK_METADATA_INVALID`

ClientはKnowledge Search page内statusへerrorを表示するため、native popupは不要。

This behavior should be preserved and message wording may be simplified.

### AI Search risk

Provider File Searchへ既に同期済みのsourceは、Drive原本が後で削除されてもprovider側のindexed copyが即時消えるとは限らない。

Therefore:
- 「Drive原本を削除したら必ず検索から自動消滅する」
とは現行構造では保証できない。
- provider responseをそのまま表示するとstale sourceを根拠にした回答を見せる可能性がある。

Work0052 must fail closed for cited sources.

## Required AI Search behavior

After provider response and citation mapping, before answer is returned to client:

1. resolve each cited source to Backend row
2. validate the registered Drive source:
   - Meeting: Doc_File_ID exists, file accessible, not trashed, expected Google Doc type/boundary as applicable
   - Pitchbook: File_ID exists, file accessible, not trashed, expected file identity
3. if any cited source is missing/inaccessible:
   - do not display AI answer
   - return safe error
   - page-inline error only
   - no popup
   - no backend mutation
   - no source recreation
   - no automatic record deactivation
   - no automatic provider index deletion in this Work

Suggested message:
`参照元のファイルが見つからないか、開くことができないため、検索結果を表示できません。対象ID: MTG-xxxxxx。Google Drive上の原本を確認してください。`

For multiple sources:
- bounded list or first source + count
- do not expose private Drive file IDs/URLs

## Search performance

Do not preflight every source in the entire corpus on every query.

Validate only the bounded set of sources actually used/cited by the provider response, unless a cheaper existing validation path exists.

This keeps failure quick without turning every search into a full Drive crawl.

## Full Output behavior

Preserve fail-fast materialization:
- missing Meeting Doc -> page-inline error
- missing Pitchbook metadata/reference -> page-inline error

No modal / alert / confirm.

No automatic cleanup.

## Direct Drive link clicks

Out of scope:
- if a user directly clicks a stored Google Drive link and Google itself shows “file not found / access denied”, that external Drive page behavior is not replaced in this Work.

This Work covers Knowledge Search / Full Output result integrity.

## Source deletion side effects

When source is missing:
- Backend Meeting_Index / Pitchbook_Index row remains
- Status remains unchanged
- relation fields remain unchanged
- no physical delete
- no Audit mutation required solely for source absence
- search request may record normal failure audit metadata if existing contract already does so

## Acceptance Evidence

### Meeting Doc missing

Synthetic indexed/cited Meeting whose registered Google Doc is unavailable:
- AI answer not shown
- inline error visible
- popup count 0
- backend mutation 0
- provider deletion 0

### Pitchbook missing

Same for Pitchbook:
- AI answer not shown
- inline error
- no mutation

### Healthy sources

- normal cited source validation passes
- search answer/citations unchanged
- no additional visible warning

### Full Output

- existing missing-source safe errors remain inline
- source ID may be shown
- Drive file ID / private URL not exposed

### Regression

- Work0049 async feedback standard preserved
- search configured-provider behavior otherwise unchanged
- console material error/warn 0
- schema/migration/permission changes 0


## User-facing Japanese wording rule

このWorkで追加・変更する利用者向け文言は、実装内部の用語を直訳せず、自然で簡潔な日本語にする。

Avoid in user-facing UI:
- 権威ある
- authoritative
- fail closed
- source materialization
- provider response
- stale source
- boundary
- contract

Preferred wording examples:
- `Meetingの権威あるGoogle Docを読み取れません。`
  -> `面談記録のGoogle Docs原本を読み込めません。`
- `PitchbookのDriveメタデータを確認できません。`
  -> `保存資料の原本ファイルを確認できません。`
- generic `確認できませんでした`
  -> 実際に失敗した処理に合わせて `読み込めませんでした` / `見つかりません` / `保存できませんでした`

内部code / error code / developer documentationではtechnical terminologyを維持してよい。


## Accepted Outcome

Work0052 completed on owner-only Web App version34.

Accepted:
- cited-source validation before answer display
- inline safe failure
- stale answer hidden
- popup/dialog 0
- no automatic mutation/cleanup
- destructive production-source qualification not performed for safety

Completion: `docs/handoffs/0052-completion-report.md`
