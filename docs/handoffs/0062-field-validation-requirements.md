# Work 0062 — field-level validation

WORK_ID: 0062
STATUS: ACTIVE
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Primary Outcome

面談登録・面談編集で、送信できない理由と修正すべき入力欄を利用者が即座に理解できるようにする。既存のserver-side validationとdata contractは維持する。

## Scope

- 対象は面談登録フォームと面談編集フォーム。
- 現行required fieldsを正本として扱う。
  - 日付
  - 面談先
  - アセットクラス
- submit時にinvalid fieldsを判定し、各field近傍へ具体的な日本語errorを表示する。
- invalid controlへ`aria-invalid="true"`を設定し、error messageを`aria-describedby`等で関連付ける。
- 複数invalidがある場合も各fieldを判別できる。
- 最初のinvalid controlへfocusする。
- 修正されたfieldのerror stateは適切なタイミングで解除する。
- 入力値は保持する。
- registration / editで同じvalidation patternを再利用できるなら共通化する。
- Quick Add modalの「具体的なerror + focus」patternを参考にする。
- 現在のserver-side validationは最後の防御として維持し、client validationで置き換えない。

## UX Rule

- error summaryを追加する場合も短くし、field-level errorと同じ説明を長々と重複させない。
- validationは送信失敗時に利用者を助けるためのもの。入力中から不要にerrorを大量表示しない。
- error消去は、利用者が修正を始めた／有効値になったことが理解できる自然なタイミングにする。

## Non-Goals

- required-field policy変更
- schema / API / payload contract変更
- 全フォーム・全fieldへのvalidation拡張
- server validation削除
- auto-save追加
- navigation IA / layout全面変更
- provider / deployment変更

## Acceptance Evidence

### Registration
- 日付のみ欠落→日付fieldに具体的error、日付へfocus。
- 面談先のみ欠落→面談先fieldに具体的error、面談先へfocus。
- アセットクラスのみ欠落→該当fieldに具体的error、そこへfocus。
- 3項目欠落→3fieldすべてinvalidと判別でき、最初のinvalidへfocus。
- field修正後→そのfieldのerror / aria-invalid解除。
- invalid submitで既存入力値を失わない。
- valid submit pathは既存semanticsを維持。

### Edit
- registrationと同じrequired fields / interaction pattern。
- invalid submit時にserver RPCを呼ばない。
- valid submitでは既存expectedVersion / dirty-state / Work0060 semanticsを維持。
- validation errorがdirty snapshotを誤ってclean化しない。

### Validation
- focused validation tests PASS。
- relevant browser: 面談登録 + 過去の記録編集、desktop / 390px。
- `npm run check` 1回 PASS。
- generated bundle更新時のみbundle validation。
- provider call / deployment / business-data mutation 0。
- unrelated pages / 過去Work全件へDecision-Impact理由なしに拡張しない。

## Completion Boundary

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。
