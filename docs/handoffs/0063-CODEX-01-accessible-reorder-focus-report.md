# Work 0063 CODEX-01 — マスター並び替えとfocus flow

WORK_ID: 0063
DISPATCH_ID: 0063-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Outcome

マスター管理の各option rowに「上へ」「下へ」を追加した。先頭の「上へ」と末尾の「下へ」は無効化し、ボタンは既存drag pathと同じ`masterDraftMove`、`masterOrderDrafts`を更新する。再描画後は移動した行の有効なボタンへfocusを戻す。保存中は移動ボタンを無効化する。drag、未保存表示、tab別draft、元に戻す、既存`REORDER_BATCH`保存契約を維持した。

sidebarのkeyboard起点のpage切替では、表示先pageの見出しへprogrammatic focusを移す。pointer起点の通常page切替ではnav buttonのfocusを保つ。過去の記録の「詳細」と「記録を編集」は読込成功後にそれぞれの見出しへfocusを移す。見出しの`tabindex="-1"`はtab orderを増やさない。編集の破棄確認・snapshotとmodalのfocus処理は変更していない。

## Evidence

| 項目 | 結果 |
|---|---|
| focused regression | `node --test tests/work0037-master-tab-state.test.cjs tests/work0046-ui-cleanup-staged-reorder.test.cjs tests/meeting-centric-ui.test.cjs`: 26/26 PASS。tab別draft、dragのstaged order、1回のbatch save、detail/related flowを確認 |
| focused browser | `node tests/work0063-accessible-reorder-focus-browser.cjs`: production HTML/CSS/client sourceとローカル合成RPCを使用。1440px/390pxともPASS。keyboardで上へ・下へ・保存、390px touchとdesktop clickで移動、境界disabled、移動行のfocus、未保存表示・元に戻す・保存、nav/page/detail/editのfocus、pointer navのfocus、編集中内容の維持を確認。body横はみ出し0、page/console error 0、外部request 0 |
| bundle | `npm run build:bundle`、`npm run check:bundle`: 30/30 PASS。`src/`から生成し、bundle/manifest整合性を確認 |
| canonical | `npm run check`: 1回、684/684 PASS |
| diff | `git diff --check` PASS。client UI、合成browser test、生成bundle、本report、dispatchに限定 |

browser screenshotsと`validation.json`は作業端末の`%LOCALAPPDATA%\Temp\ksp-work0063-accessible-reorder-focus\`に保存した。合成RPCでの保存はテスト内メモリのみで、実業務データは変更していない。390pxのマスター表は既存の表内横スクロールを使い、ページ本体には横はみ出しがない。

## Completion boundary

- `LOGIC_VALIDATION`: PASS
- `TARGET_RUNTIME_QUALIFICATION`: NOT RUN（実利用Web Appへのdeployment・動作確認は本Dispatchのscope外）
- `SIDE_EFFECT_STATE`: provider call、deployment、business-data mutation 0
- `BLOCKER`: 本Dispatchのlocal acceptanceに対してNONE
- `READY`: ChatGPT final reviewに提出可能。target-runtime READYは未判定
- `WORK_0063_COMPLETE`: NO
- `COMPLETION_LATCH`: NOT_APPLIED

## Shared Knowledge

- `KNOWLEDGE_RETRIEVAL`: RULE-0001, RULE-0002
- `KNOWLEDGE_APPLIED`: NONE
- `NEW_KNOWLEDGE_CANDIDATE`: NO

WORK_ID: 0063
DISPATCH_ID: 0063-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
