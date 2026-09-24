# Work 0062 CODEX-01 — 面談フォームのfield-level validation

WORK_ID: 0062
DISPATCH_ID: 0062-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Outcome

面談登録・面談編集の現行required fields（日付、面談先、アセットクラス）に共通のclient validationを追加した。submit時に欠落項目すべての近くへ具体的な日本語errorを表示し、各controlに`aria-invalid="true"`と該当errorへの`aria-describedby`を設定して、最初のinvalid controlへfocusする。初期表示ではerrorを隠し、field修正時はそのfieldのerrorを解除する。すべて修正した場合は短いsummaryも消す。Quick Addで面談先を選んだ場合もerrorを解除する。

invalid submitでは入力値を保持し、server RPCへ進まない。編集のdirty snapshotはvalidation errorで更新しない。valid save後のsnapshot更新、`expectedVersion`、server-side validationは維持した。provider server logic、schema、API、payload contract、navigation IA、他フォームは変更していない。

## Evidence

| 項目 | 結果 |
|---|---|
| focused logic/UI | `node --test tests/work0062-field-validation.test.cjs tests/work0060-unsaved-edit-protection.test.cjs tests/meeting-centric-ui.test.cjs`: 17/17 PASS。3項目のerror関連付け、複数欠落、focus、修正時解除、既存入力保持、dirty snapshotと登録flowを確認 |
| relevant browser | `node tests/work0062-field-validation-browser.cjs`: production HTML/CSS/client sourceと合成RPCで面談登録・過去の記録の面談編集を1440px/390pxで確認。両viewportともPASS。3項目／単独項目の欠落、invalid時RPC 0、Quick Add後のerror解除、valid登録・保存、編集dirty→save後clean、`expectedVersion`維持を確認。横はみ出し0、page/console error 0 |
| bundle | source commit `7971d0eaaf08d6eb35b60e8d3c8a0e9f61a491e0`から`npm run build:bundle`、`npm run check:bundle`: 30/30 PASS |
| canonical | `npm run check`: 最終684/684 PASS。初回は旧status文言のtest、2回目は新helper未読込のtest harnessが失敗。対応する期待値・harnessを更新し、3回目でPASS |
| diff | `git diff --check` PASS。client source、直接結合するtests、生成bundle、本report、dispatchのみ |

browser screenshotsは作業端末の`%LOCALAPPDATA%\Temp\ksp-work0062-field-validation-browser\`に保存した。browserの登録・編集・Quick Addはローカルの合成RPCのみで処理した。

## Completion boundary

- `LOGIC_VALIDATION`: PASS
- `TARGET_RUNTIME_QUALIFICATION`: NOT RUN（実利用Web Appへのdeployment・動作確認は本Dispatchのscope外）
- `SIDE_EFFECT_STATE`: provider call、deployment、business-data mutation 0
- `BLOCKER`: 本Dispatchのlocal acceptanceに対してNONE
- `READY`: ChatGPT final reviewに提出可能。target-runtime READYは未判定
- `WORK_0062_COMPLETE`: NO
- `COMPLETION_LATCH`: NOT_APPLIED

## Shared Knowledge

- `KNOWLEDGE_RETRIEVAL`: RULE-0001, RULE-0002
- `KNOWLEDGE_APPLIED`: NONE
- `NEW_KNOWLEDGE_CANDIDATE`: NO

WORK_ID: 0062
DISPATCH_ID: 0062-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
