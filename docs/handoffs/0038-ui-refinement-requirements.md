# Work 0038 — Post-version13 UI refinement intake

WORK_ID: 0038
STATUS: ACTIVE
MODE: BUILD
PHASE: REQUIREMENTS_FROZEN

## Purpose

Work0037/version13をbaselineに、追加の画面レイアウト修正を口頭指示ベースで収集する。

現時点ではCodex Dispatchを発行しない。要件の曖昧点を解消してからimplementation contractをfreezeする。

## Baseline

```text
PRODUCTION_BASELINE: Work0037 / version13
PR_BASELINE: #59 merged
NORMAL_NAVIGATION: 7/7 PASS
LAYOUT_LANGUAGE: 12 columns / 14px / max-width2000
WORK_0030: DEFERRED_BY_USER
```

## Screen: ナレッジ検索

### Label

- `検索モード`を`AI検索モード`へ変更する。

### Non-AI output control

- 既存のnon-AI Full Output / `全文出力` behavior自体は維持する。
- exact placementは次で確定:
  - `AI検索モード`
  - そのすぐ右に`AIモデル`
  - その右に少し間を空けて`非AI出力` / `全文出力`button
- AI controlsとnon-AI outputの間には通常のfield gapより少し大きいvisual separationを持たせ、別系統の操作であることを示す。
- buttonは同じrow内に置き、desktopでは右端へ飛ばさずAIモデルの隣接領域に配置する。

### Preserve

- AI検索モードの既存mode semanticsは変更しない。
- non-AI Full OutputはAI provider未設定でも利用可能というaccepted behaviorを維持する。

## Screen: 記録を追加

### Register button

- `登録`buttonを`当社側`入力欄のすぐ下に配置する。
- 左寄せ / compactを基本とし、既存submit / busy / validation / retry semanticsは変更しない。

### Attachment placement

- `資料を添付（任意）`sectionを、`面談相手` / `当社側`の右側へ移動する。
- desktopでは、左側に`面談相手`→`当社側`→`登録`、右側にattachment blockを置く2-column regionとして整理する。
- attachment blockは十分な縦スペースを確保し、左側のparticipants領域と視覚的に揃える。
- file drop areaの横幅はversion13よりさらに小さくする。
- drop areaとaction buttonsの配置はbutton labelが切れず、操作しやすい幅を優先する。
- mobile <=720pxでは安全にstackしてよい。

### Rename

- attachment action `選択をクリア`を`資料選択をクリア`へ変更する。
- clear behavior自体は変更しない。

### Preserve

- file drop / click selection / retry / clear semanticsは維持。
- notes height、Counterparty modal、Equity/Debt policy、Meeting Type behaviorは本要件で変更しない。

## Closed decision

ナレッジ検索のnon-AI Full Output placementは`AI検索モード → AIモデル → 少し間を空けて → 非AI出力`で確定。

## Dispatch state

Requirements frozen. Active implementation dispatch: `0038-CODEX-01`.
## Frozen implementation geometry

### Knowledge Search Row 3

Desktop canonical order:
`AI検索モード → AIモデル → 非AI出力`

12-column placement:
- AI検索モード: start1 span3
- AIモデル: start4 span3
- 非AI出力: start7 span2

`AIモデル`は`AI検索モード`のすぐ横に配置し、間にintentional blank columnを置かない。

`非AI出力`は一段上の`Asset Class`と同じhorizontal start位置に揃える。Work0037/version13のAsset Classはstart7なので、non-AI outputもstart7とする。前案start8より1 column左へ移動。

HTML/source orderも`AI検索モード → AIモデル → 非AI出力`に揃え、mobile stackでも同じ順序を維持する。

### Meeting-create participant / attachment region

Desktop canonical placement:
- 面談相手: start1 span6, row3
- 当社側: start1 span6, row4
- 登録: start1 span3程度, row5（当社側のすぐ下）
- 資料を添付（任意）: start7 span6, row3からrow4の2行分のみ
- 面談内容: full width, row6

Attachment vertical sizing:
- attachment関連エリア全体の縦の長さは、左側の`面談相手` + `当社側`の2 field分の合計高さと揃える。
- attachment blockはrow3/span2で完結させ、登録buttonのrow5までは伸ばさない。
- 左右の上端・下端が視覚的に揃うことを優先する。

Attachment content:
- `資料を添付（任意）`直下にあった`記録保存 → ファイル保存 → 関連付けの順に処理します。`help textは削除する。
- drop areaはversion13より縦方向を縮小する。
- `資料選択をクリア`と`未完了分を再試行`はdrop areaのすぐ下に配置する。
- buttonsはdrop area下のcompact action rowに置く。desktopでは横並びを基本とし、labelが切れる場合のみ安全にwrap可能。
- action buttonsをdrop area右横の専用columnへ置かない。
- `資料選択をクリア`labelは維持する。

Mobile:
- <=720px: 面談相手 → 当社側 → 登録 → 資料を添付 → 面談内容の順でsafe stack。
- attachment内はdrop area → action buttonsの順。

### Preserve

- file drop / click selection / retry / clear semanticsは維持。
- notes height、Counterparty modal、Equity/Debt policy、Meeting Type behaviorは変更しない。

## Latest superseding decision

2026-09-20 user refinement:
- Knowledge non-AI output start8案はSUPERSEDED。start7へ移動しAsset Classとhorizontal alignment。
- Attachment row3/span3 + side action column案はSUPERSEDED。row3/span2でparticipants 2行と同高にし、buttonsはdrop area直下へ。
- attachment help textは削除。
## Latest superseding decision — 2026-09-20 (2)

Previous `clear/retry immediately below drop zone` geometry is SUPERSEDED.

Final desktop geometry:
- left participant area is widened from 6/12 to 7/12.
- right attachment area is narrowed from 6/12 to 5/12.
- 面談相手: start1 span7, row3.
- 当社側: start1 span7, row4.
- attachment block: start8 span5, row3/span2.
- 登録: row5 left, compact.
- `資料選択をクリア` and `未完了分を再試行` move OUTSIDE the attachment block and are placed on row5, same horizontal band as the Register button, aligned under the attachment area.
- drop zone uses essentially the full width of the narrower attachment block; no internal action column and no action row inside the attachment panel.
- attachment default vertical height still equals the combined height of 面談相手 + 当社側 only (row3/span2).
- attachment help text remains removed.
- drop zone remains slightly shorter vertically than version13.
- mobile safe stack may place register, then clear/retry, then attachment or attachment then actions as long as semantic grouping is clear and no horizontal overflow; desktop geometry above is canonical.

Rationale:
- width previously consumed by attachment actions is reallocated to participant fields.
- the attachment panel itself becomes narrower, while the drop zone gains usable internal width because the action controls no longer share its box.
## Latest user refinement — Meeting-create header / status

2026-09-20 user instruction. This is additional scope after CODEX-01 RETURNED and is implemented under `0038-CODEX-02`.

### Header row

- `記録を追加` heading、`下書きをクリア`button、initial ready statusを同じ冒頭1段目に配置する。
- visual order: `記録を追加` → `下書きをクリア` → `面談入力の準備ができました。`
- `下書きをクリア`はheadingのすぐ右。過度に離さない。
- `下書きや入力内容を消去して、新しい記録を開始できます。` help textは削除する。
- 旧`record-entry-actions`のfull-width information barとしては表示しない。

### Initial ready status

- bootstrap success message `面談入力の準備ができました。`をページ最下部から冒頭1段目へ移動する。
- initial ready statusはcontent幅に応じたcompact inline status。full-widthにしない。
- heading/clear buttonと同じheader row内に置く。

### Status behavior preservation

- initial ready messageだけtop rowのcompact statusへ表示する。
- validation error、submit success/error、retry state等の既存`meeting-status` behaviorを失わない。
- implementationはsingle status nodeをtop rowへ移動して再利用しても、initial-ready専用inline node + operational status nodeを分けてもよい。
- ただし同じmessageが上下に二重表示されないこと。
- error/success statusが必要な時は読みやすい幅を確保し、compact化のためにmessageをclipしない。

### Responsive

- desktop: heading + clear + initial statusを1 row。
- narrow/mobile: safe wrapを許容。順序はheading → clear → status。
- horizontal overflow 0。
## Latest user refinement — Knowledge Search help line

2026-09-20 user instruction. Implement under `0038-CODEX-03` on the same Draft PR #60.

### AI検索 指示入力欄 help

現在は次の2文が別blockで上下2段に表示される:
1. `表示された質問は読み取り専用です。選択した条件の資料を横断して整理します。`
2. `Teamは「面談記録のみ」で利用できます。`

修正後は同じhelp line内で連続表示する:

`表示された質問は読み取り専用です。選択した条件の資料を横断して整理します。 Teamは「面談記録のみ」で利用できます。`

Requirements:
- desktopでは意図的な改行を入れず1行表示。
- `knowledge-mode-help`のdynamic文言はmodeに応じて従来どおり変化可能だが、`knowledge-source-help`と同じinline help containerに並べる。
- user指定の通常`要約`modeでは上記exact 2文が同一行。
- source-help sentenceは削除しない。
- mobile/narrowではhorizontal overflowを避けるため自然wrap可。explicit `<br>`やblock separationは作らない。
- AI検索 behavior / validation / filtersは変更しない。