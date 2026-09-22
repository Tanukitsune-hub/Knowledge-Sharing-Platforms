# Work 0052 参照元ファイル消失時の安全な停止 実装報告

WORK_ID: 0052
DISPATCH_ID: 0052-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Outcome

AI検索の回答を返す前に、引用したMeeting / PitchbookだけをBackend登録IDからDrive原本へ照合する。ID、アクセス、Trash状態、MeetingのGoogle Docs形式、登録folderとの一致を確認できなければ回答と引用を返さず、安全な対象IDを含むページ内エラーを表示する。非同期完了と保存済み結果の再表示にも同じ検証を適用した。過去の回答はエラー時に非表示へ戻す。

全文出力で既存の原本読み取り・参照確認を維持し、利用者向けエラー文言を簡潔にした。出典以外の全資料への事前照会、原本再作成、BackendのStatus・行変更、provider index削除は行わない。

## Validation

| Evidence | Result |
|---|---|
| Focused missing-source tests | 11/11 PASS |
| `npm run check` | 666/666 PASS |
| Bundle regeneration | PASS、1,302,346 bytes / 19,970 lines |
| `npm run check:bundle` | 30/30 PASS |
| `git diff --check` | PASS |
| Deterministic browser | PASS、18 checks、page error 0、console error/warn 0、popup 0、blocked request 0 |
| Scope boundary | PASS、schema / migration / permission / provider設定変更なし |

合成テストではMeetingとPitchbookの欠落、アクセス不可、Trash、登録ID欠落、原本ID不一致、Meeting MIME不一致、folder不一致、引用外資料を走査しないこと、回答後の原本消失と再表示の拒否を確認した。provider回答完了時は成功Auditより先に停止する。browser証跡は `0052-CODEX-01-browser-evidence/` に保存した。実Workspace / Apps Scriptの資格確認ではない。

## Boundaries and handoff

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: NOT_RUN_BY_STACK_BOUNDARY
SIDE_EFFECT_STATE: REPOSITORY_ONLY
LIVE_MUTATION_COUNT: 0
APPS_SCRIPT_SOURCE_SYNC: 0
IMMUTABLE_VERSION_CREATE: 0
DEPLOYMENT_UPDATE: 0
REAL_DRIVE_FOLDER_OR_FILE_CREATE: 0
REAL_TRIGGER_CREATE: 0
REAL_RETENTION_TRASH: 0
PROVIDER_CALLS: 0
REAL_BUSINESS_DATA_MUTATION: 0
PERMISSION_CHANGE: 0
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
RUNTIME_READY: NO
COMPLETION_LATCH: NOT_APPLIED
WORK_0030: DEFERRED_BY_USER
```

後続Work0053はこのbranchの確定headをbaseにする。PRはDraftで保持する。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002
NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0052
DISPATCH_ID: 0052-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
