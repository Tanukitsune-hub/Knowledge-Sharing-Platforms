# Work 0060 CODEX-01 — 面談編集の未保存内容保護

WORK_ID: 0060
DISPATCH_ID: 0060-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Outcome

「過去の記録」の面談編集フォームに初期snapshotとdirty判定を追加した。未保存内容を破棄する「編集を終了」、別recordの編集開始、詳細の「選択解除」では確認し、cancelでは入力・編集中record・現在のdetail stateを維持する。同じrecordの再編集操作、detail閲覧の切替、page navigationでは編集stateを維持し、不要な確認を出さない。保存成功時は新しい保存済みsnapshotと更新番号を採用する。

編集見出しには面談先・日付・Meeting ID・更新番号を表示する。reset時はhiddenのMeeting IDと更新番号も消去する。既存の関連資料値を保存payloadに維持し、serverの`expectedVersion`契約は変更していない。

## Evidence

| 項目 | 結果 |
|---|---|
| focused logic/UI | `node --test tests/work0060-unsaved-edit-protection.test.cjs tests/work0040-past-meeting-edit-cleanup.test.cjs tests/work0041-past-meeting-usability.test.cjs`: 13/13 PASS |
| relevant browser | `node tests/work0060-past-meeting-browser.cjs`: 1440×900、390×844ともPASS。clean close、dirty close、cancel/confirm、別record、detail選択解除、page navigation、save後、関連資料IDの維持を合成RPCで確認。横はみ出し0、page/console error 0 |
| bundle | `npm run build:bundle`後、`npm run check:bundle`: 30/30 PASS。生成物はsource commit `39d32a2b037bc9c974548679e347f2956d204f7d`に対応 |
| canonical | `npm run check`: 674/674 PASS。初回は変更後のbundle未生成でstale判定となり停止。再生成後の2回目でPASS |
| diff | `git diff --check` PASS。source／tests／生成bundle／本report／dispatchのみを対象 |

Browser pluginはこのsessionで利用不可のため、既存のPlaywright runtimeを使用した。browserはproduction HTML/CSS/client sourceを読み込み、RPCのみ合成応答とした。画像は`past-meeting-edit-1440.png`、`past-meeting-edit-390.png`として作業端末の一時領域に保存した。

## Completion boundary

- `LOGIC_VALIDATION`: PASS
- `TARGET_RUNTIME_QUALIFICATION`: NOT RUN（実利用Web Appへの反映・確認はWork0065の条件付きscope）
- `SIDE_EFFECT_STATE`: 外部RPC・provider call・deployment・本番data mutation 0。browserの保存操作は合成RPCのみ
- `BLOCKER`: 本Dispatchのlocal acceptanceに対してNONE
- `READY`: ChatGPT final reviewに提出可能。target-runtime READYは未判定
- `WORK_0060_COMPLETE`: NO
- `COMPLETION_LATCH`: NOT_APPLIED

## Shared Knowledge

- `KNOWLEDGE_RETRIEVAL`: RULE-0001, RULE-0002
- `KNOWLEDGE_APPLIED`: NONE
- `NEW_KNOWLEDGE_CANDIDATE`: NO

WORK_ID: 0060
DISPATCH_ID: 0060-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
