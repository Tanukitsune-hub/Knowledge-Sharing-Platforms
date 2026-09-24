# Work 0063 — accessible reorder and focus flow

WORK_ID: 0063
STATUS: ACTIVE
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Primary Outcome

マスター並び替えをdragに依存せずmouse / touch / keyboardで完結できるようにし、page / detail / edit切替後のkeyboard focusを意味のある場所へ移して、操作位置を見失いにくくする。

## Scope A — Master reorder

- 現行drag & dropは維持する。
- 同じ`masterOrderDrafts` / `masterDraftMove`のstateを使うsingle-pointer / keyboard-compatible alternativeを追加する。
- 各option rowから「上へ」「下へ」等の明示的操作を実行できるようにする。
- first rowでは「上へ」、last rowでは「下へ」をdisableする。
- 並び替え後も移動したrow付近の合理的なcontrolへfocusを維持する。
- 既存の未保存order、保存、元に戻す、tab切替時のdraft semanticsを維持する。
- dragによる並び替えとbuttonによる並び替えが別stateにならないようにする。

## Scope B — Focus flow

主要な明示操作でpage / detail / editを切り替えた時、scrollだけでなくkeyboard focusも意味のあるdestinationへ移す。

少なくとも確認する:
- sidebar/nav buttonから通常pageへ切替
- 過去の記録で「詳細」を開く
- 詳細から「記録を編集」を開く
- Entity Workspace等、既存の明示navigationでpageを切り替える主要経路

実装は必要十分に限定する。

### Focus policy

- pointer clickのたびに過剰なfocus jumpを起こさない。
- keyboard起点または明示的なpage/detail/edit navigationで、次の操作位置が不明になる箇所を優先する。
- destinationはpage heading、detail heading、edit heading、または最初の意味あるcontrolなど、現在のDOMに自然に適合するものを選ぶ。
- `tabindex="-1"`を使う場合はprogrammatic focus用に限定し、tab orderへ不要な項目を追加しない。
- modalの既存focus trap / close後focus returnは変更しない。
- Work0060のdirty-state protectionを壊さない。focus改善のために未保存内容をresetしない。

## Accessibility Intent

- drag操作だけに依存しない。
- keyboardだけでもoption reorder → saveまで完結できる。
- touch / clickでもdrag gestureなしでreorderできる。
- page / detail / editを開いた後、keyboard利用者が現在位置を把握できる。

formal WCAG certificationを行うWorkではない。

## Non-Goals

- drag & dropの廃止
- master data API / schema変更
- navigation IA変更
- 全画面のfocus architecture再設計
- modal focus logic変更
- screen reader全体の再認定
- new component framework導入
- provider / deployment変更

## Acceptance Evidence

### Master reorder
- dragなしで「上へ」「下へ」操作により順序変更できる。
- keyboardだけでreorderし、既存「保存」まで完了できる。
- first / last boundary controlが適切にdisabled。
- reorder後にfocusが消失せず、移動対象付近へ残る。
- drag pathとbutton pathが同じdraft orderを更新する。
- reset / save / unsaved indicatorの既存semantics維持。

### Focus flow
- navからpage切替後、keyboard起点ではdestination focusが意味のあるpage contextへ移る。
- 過去の記録の「詳細」→detail contextへfocus。
- 「記録を編集」→edit contextへfocus。
- focus移動でWork0060 dirty inputを失わない。
- pointer利用時に不要なfocus stealingがないことを確認する。

### Validation
- focused reorder / focus tests PASS。
- relevant browser: マスター管理 + 過去の記録 + representative nav transition、desktop / 390px。
- keyboard interactionを実際にexerciseする。
- `npm run check` 1回 PASS。
- generated bundle更新時のみbundle validation。
- provider call / deployment / business-data mutation 0。
- unrelated pages / 過去Work全件へDecision-Impact理由なしに拡張しない。

## Completion Boundary

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。
