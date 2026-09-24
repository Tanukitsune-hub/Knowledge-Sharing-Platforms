# Work 0060 — unsaved edit protection

WORK_ID: 0060
STATUS: ACTIVE
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Primary Outcome

「過去の記録」の面談編集で、入力途中の内容が意図せず消えたり、現在見ている記録と編集中の記録を取り違えたりしないようにする。

## Scope

- 面談編集フォームの初期snapshotとdirty stateを管理する。
- 実際に編集内容を破棄する操作だけで確認する。
  - 「編集を終了」
  - 別の記録を編集対象として読み込む
  - 詳細の「選択解除」等で編集stateもresetされる場合
- 単なるpage navigationで編集DOM/stateが保持される場合は不要な確認を出さない。
- 編集中の対象を現在より明確に表示する。Meeting IDを維持し、面談先・日付等のhuman-readable contextを必要十分に示す。
- 保存成功後はdirty stateを新しい保存済みsnapshotへ更新する。
- server concurrency / expectedVersion contractを維持する。
- 既存のdetail / edit / related-material flowを壊さない。

## UX rule

確認dialogを増やすこと自体を目的にしない。内容を失う場合だけ確認し、cancelでは入力・編集対象・detail stateを維持する。

## Non-Goals

- 新規面談登録のdraft設計変更
- server autosave追加
- schema / API / payload contract変更
- navigation IA変更
- 編集画面の全面 redesign
- provider / deployment変更

## Acceptance Evidence

- 未変更で「編集を終了」: 確認なしで終了できる。
- 変更ありで「編集を終了」: 破棄確認が出る。
- 変更ありで別recordを編集: 破棄確認が出る。
- 変更ありで編集stateを消す詳細選択解除: 破棄確認が出る。
- cancel: 入力内容・編集中record・現在stateを維持する。
- confirm: resetまたは別recordへの切替が正しく完了する。
- 保存成功後: dirty stateが更新され、不要な破棄確認が出ない。
- 現在何を編集中か、Meeting IDに加え利用者が識別しやすいcontextが表示される。
- focused logic/UI tests PASS。
- relevant browser: 過去の記録 desktop + 390px PASS。
- `npm run check` 1回 PASS。
- generated bundleを更新した場合のみbundle validationを実施。
- unrelated pages / provider / backup / target-runtime deploymentへは具体的なDecision-Impact理由がない限り拡張しない。

## Completion boundary

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。
