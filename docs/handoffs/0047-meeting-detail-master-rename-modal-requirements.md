# Work 0047 — Meeting detail empty identity cleanup + Master rename modal requirements

WORK_ID: 0047
STATUS: ACTIVE
MODE: BUILD
BASELINE: Work0046 version28
ACTIVE_DISPATCH: 0047-CODEX-01
BALL: CODEX

## Primary Outcome

Work0046 accepted UIを維持しながら、以下2点を限定修正する。

1. 過去の記録 > 記録の詳細で、未選択時にタイトル直下へ表示される空のpill / dotを消す。
2. マスター管理の「名称変更」をbrowser native `prompt()` から専用modalへ置き換える。

## Confirmed root cause — empty dot

Current DOM:
```html
<p id="meeting-detail-identity" class="hint meeting-detail-hero"></p>
```

Current CSS:
```css
#meeting-detail-identity.meeting-detail-hero {
  display:inline-flex;
  padding:8px 12px;
  border:1px solid ...;
  border-radius:999px;
  ...
}
```

未選択時はtextが空でもpadding / borderが残るため、画像の小さいpill状の点として見えている。

### Required behavior

- 未選択 / empty identityでは完全に非表示。
- Meetingを選択しidentity textが入った場合は、現行のMeeting ID / Version hero表示を維持してよい。
- 選択解除後は再び非表示。
- layout shift / extra vertical gapを残さない。

最小実装候補:
```css
#meeting-detail-identity.meeting-detail-hero:empty { display:none; }
```

同等以上に明示的なhidden controlでもよいが、不要なclient complexityを増やさない。

## Master rename modal

### Scope

マスター管理の既存「名称変更」buttonをすべて専用modal化する。

対象:
- 面談先
- アセットクラス
- 面談場所
- チーム

現在の `prompt('新しい名称', ...)` は廃止する。

### Modal presentation

Existing modal visual languageを再利用し、新しいdesign systemを作らない。

Dynamic title examples:
- 面談先の名称変更
- アセットクラスの名称変更
- 面談場所の名称変更
- チームの名称変更

Fields / actions:
- current nameを入力済みのtext input
- label: `新しい名称`
- `キャンセル`
- `変更を保存`
- close `×`
- status area

### Interaction

Open:
- 「名称変更」button clickでmodal open
- current name prefilled
- inputへfocus
- 全選択または自然に編集可能なcaret state

Save:
- trim後emptyはclientでreject
- backendの既存master name validation / duplicate checkをauthoritativeとして維持
- exactly one existing rename mutation RPC
- success時modal close + master list refresh
- statusはmaster page側へ成功表示してよい

Failure:
- duplicate / server error時はmodalを閉じない
- modal内statusでエラー表示
- 入力値を保持し、修正して再submit可能

Cancel / close:
- server mutation 0
- draft text破棄
- triggering rename buttonへfocusを戻す（buttonがまだ存在する場合）
- Escapeでclose
- backdrop click closeは任意。実装する場合もserver mutation 0

Keyboard / accessibility:
- `role="dialog"`
- `aria-modal="true"`
- titleとの`aria-labelledby`
- Enterでform submit
- Escape close
- focusがdialog外へ不自然に飛ばないこと
- mobile 390pxでoverflowしない

### Master reorder interaction preservation

Work0046のstaged reorder contractを維持する。

- reorder draft dirty時のOption rename button disabledを維持
- modal経由でdirty stateをbypassしない
- Counterpartyは従来通りrename可
- modal open/cancelでreorder draftを変更しない

## Non-goals

- Master mutation backend semantics変更
- Counterparty / Option schema変更
- rename audit contract変更
- reorder contract変更
- Meeting ID / Version heroのselected-state design変更
- Work0030
- other native confirm dialogsの置換

## Acceptance Evidence

### A. Empty hero

Past Meeting page initial state:
- `meeting-detail-identity` text empty
- visible pill / dot 0
- computed display = none または equivalent hidden
- titleとempty-state間に不要なhero gap 0

Meeting選択後:
- Meeting ID / Version identityは表示
- selected-state hero design regress 0

選択解除後:
- hero再非表示

### B. Rename modal

各4 master tabで:
- rename button opens custom modal
- native `prompt()` call count for master rename = 0
- correct dynamic title
- current name prefilled
- cancel = mutation 0
- valid rename = exactly 1 rename RPC
- success closes modal
- duplicate/invalid error keeps modal open
- Escape close
- Enter submit
- focus return
- 1440 / 390 visual PASS

### C. Work0046 regression

- staged reorder dirty disabling preserved
- drag-before-save RPC 0
- Analytics / Entity summary / Follow-up cleanup preserved
- Counterparty ID visibility cleanup preserved
- Theme Settings preserved
- 7 normal pages nonblank
- console material error/warn 0
- schema/migration/provider/permission changes 0
