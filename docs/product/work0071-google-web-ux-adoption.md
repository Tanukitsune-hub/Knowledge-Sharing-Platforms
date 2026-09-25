# Work0071 — Google Web UX KB取り込み方針

更新日: 2026-09-25  
対象: Alternative Assets Intelligence  
参照情報源: Project Source `web_ux_knowledge_v1_20260925.md`  
Document ID: `GOOGLE-WEB-UX-KB`  
Version: 1.0  
原典確認日: 2026-09-25

## 位置づけ

この文書は、Project Sourceに保存された「Web UX設計・実装ナレッジ辞典」をAlternative Assets Intelligenceへどう適用するかを決めるWork0071用の適用マトリクスである。

同資料自身の参照契約に従い、64ルールを一律適用しない。現在のユーザー課題、実装、主要タスク、端末、機密性、既存contractに影響する少数のルールを選び、実装と検証を一組で採用する。

情報源はProject要件、GitHub正本、security/data contractを上書きしない。Google/Web標準由来の知識と、本資料の編集上の提案を区別し、実測していない効果を「改善済み」と扱わない。

## この製品で優先する主要タスク

Work0071では、UXの良し悪しを単一スコアへ置き換えず、次の主要タスクが安定して完了できることを中心にする。

1. 記録を入力して保存する。
2. ファイルを選択・保存し、失敗時に安全に再試行する。
3. 過去の記録を検索・確認・編集する。
4. Knowledge Search / Full Outputを実行し、結果を読み返す。
5. 集計・管理操作を行い、処理状態と結果を誤認しない。

## 既存の強いbaseline

Work0049でapp-wide async feedback standardはすでに実装済み。

- shared `kspSetActionBusy()`
- button spinner
- button widthのmin-width保持
- `aria-busy`
- `.status.busy`
- duplicate submit防止
- reduced-motionでspinner animation停止
- normal mutationでfullscreen overlayを使わない

Work0071はこれを置き換えない。

今回の改善点は、busy feedbackが存在するかではなく、status/file metadata/resultの表示変化によって周囲のgeometry・read position・focusが不必要に動く点を解消することである。

## 採用ルール — Core

### Layout stability

| Rule | 採用 | この製品への適用 |
|---|---|---|
| UX-CLS-002 | MUST | title/action/statusの骨格を先に固定し、busy/success/errorでcontentだけ置換する |
| UX-CLS-003 | MUST | 読んでいる・押そうとしているcontrolの上へstatusやfile metadataを後挿入しない |
| UX-CLS-004 | MUST | initial loadだけでなくsave/upload/search操作中のshiftを直接測る |
| UX-CLS-005 | MUST | error/retry/emptyでもaction/status regionを急に消してcontrolを移動させない |

UX-CLS-001は画像・iframe中心のruleであり、Work0071の主要問題には通常適用しない。該当surfaceが見つかった場合のみ使う。

### Interaction responsiveness / async state

| Rule | 採用 | この製品への適用 |
|---|---|---|
| UX-INP-001 | MUST | click受付を早く描画し、処理完了と分離。既存busy helperを維持 |
| UX-FORM-005 | MUST | idle/validating/pending/success/error/recoveryを明確にし、二重送信・偽successを防ぐ |
| UX-NAV-005 | SHOULD | search/filterの古いresponseが新しい状態を上書きしないことを変更surfaceで確認 |

CPU/Worker/content-visibility等のINP最適化は、actual long task/描画ボトルネックを観測した場合だけFOLLOW_UPとする。

### Form recovery / error comprehension

| Rule | 採用 | この製品への適用 |
|---|---|---|
| UX-FORM-003 | MUST | client validationとserver validationを役割分担し、server contractを弱めない |
| UX-FORM-004 | MUST | errorは「場所・理由・修正方法」を対象field近傍で示す。global statusだけに依存しない |
| UX-FORM-007 | MUST | normal draftを無断永続化せず、retry/unknown-outcome safety stateだけ保持するWork0070 contractを維持 |

Work0070で閉じた「silent 24h draft restoreを廃止」「safety recovery stateは保持」はこのrule群と整合するため、再設計しない。

### Accessibility / focus

| Rule | 採用 | この製品への適用 |
|---|---|---|
| UX-A11Y-002 | MUST | DOM/visual orderを合わせ、async feedbackでfocusを勝手に移動しない |
| UX-A11Y-003 | MUST | action barをsticky/overlay化する場合でもfocused controlを隠さない |
| UX-A11Y-005 | SHOULD | success/warning/errorを色だけでなく文言・形状でも区別 |
| UX-A11Y-008 | MUST | existing prefers-reduced-motion behaviorを維持し、新しいmotionにも適用 |

### Responsive / input method

| Rule | 採用 | この製品への適用 |
|---|---|---|
| UX-RWD-001 | MUST | changed surfacesを320 CSS px相当・390px・拡大で確認し、主要タスクを失わない |
| UX-RWD-003 | SHOULD | primary actionsは十分なhit areaを確保。密なtable row actionは比較関係とspaceを見て判断 |
| UX-RWD-004 | MUST | hoverだけでsaved filename/detail/error recoveryへ到達させない |
| UX-RWD-006 | SHOULD | 日本語long labels/filenamesと英数字ID混在でgeometryを確認 |

48×48 CSS pxはGoogle系資料の設計目安であり、一律のWCAG AA必須値として扱わない。密な業務UIを機械的に大型化せず、primary actionとtouch利用surfaceを優先する。

### QA / evidence

| Rule | 採用 | この製品への適用 |
|---|---|---|
| UX-MET-001 | MUST | CLS/Lighthouse単独でUX合格としない。task success・focus・error recoveryを別判定 |
| UX-QA-001 | MUST | automated browser + keyboard/focus/manual observationを組み合わせる |
| UX-QA-002 | MUST | idle→input→pending→success/error→retryの一巡を試す |
| UX-QA-005 | MUST | implemented / observed / not runを分けてreport |
| UX-QA-006 | MUST | UX変更後もfilter/source/record/resultの意味とauthoritative dataが一致することを回帰確認 |

## 画面別レシピの採用

### R03 — 入力・認証・保存フォーム

「記録を追加」と「過去の記録の編集」の主レシピとする。

- label/description/required
- inline validation
- pending/success/error
- duplicate prevention
- retry/unknown outcome
- input retention boundary

### R02 — データダッシュボード・比較表

Activity Analytics、Entity Workspace、Past list/filterへ条件付きで使う。

- filter/actionを先に固定
- 0件/未取得/errorを区別
- result更新で操作領域を動かさない
- stale responseの上書きを防ぐ

### R05 — AIストリーミング・長時間処理

Knowledge Search / Full OutputのUI設計に適用する。ただしWork0071ではprovider/business logicを変更しない。

- short statusとlong resultを分離
- progress不明時にfake percentageを出さない
- result追加で読位置を奪わない
- 中断/失敗/完了を混同しない

## Shared UX primitives — implementation hypothesis

Work開始時のbefore measurementで有効性を確認し、最小のshared patternへ固定する。

### Stable Action Region

主要保存・実行buttonを、伸びる本文/file list/resultから分離する。

第一候補:

- form/card上部のaction row
- heading/action/statusを同じstable shellに置く

stickyは必須ではない。長いformで便益がある場合のみ使用し、focus obscurationが0であることを条件にする。

### Stable Status Slot

現行 `.status` はhidden→visible時にblock/margin/paddingを追加するため、対象surfaceではgeometryを予約するvariantを導入する。

候補contract:

~~~text
idle       : short reserved slot / visually quiet
validating : same slot
pending    : same slot + busy semantics
success    : same slot
warning    : same slot
error      : same slot
~~~

長文errorは無制限にslotを伸ばさず、短いsummary + explicit detailを検討する。ただしretry/unknown outcome等の重要情報は自動消去しない。

### Stable File Queue

- original filenameをprimary row identityに固定。
- generated/saved filenameはsecondary metadata。
- status badgeは同じrowで置換。
- long filenameでprimary actionを押し下げない。
- busy overlayを使う場合はfile workspace内だけにanchor。
- partial failure / retry targetはoverlay解除後も残す。
- max 10 filesでpage全体が不必要に伸び続ける場合だけbounded internal scrollを採用する。nested scrollの弊害が大きければ採用しない。

### Inline Error Contract

changed formsでは、global statusだけでなく対象fieldへ:

- `aria-invalid`
- `aria-describedby`
- persistent inline message
- first actionable invalid fieldへのfocus

を揃える。

## Surface priority

### Phase A — 必須

1. 記録を追加 / 面談メモ
2. 記録を追加 / 資料保存
3. 記録を追加 / ニュース
4. 記録を追加 / 評価
5. shared file upload / retry / partial success
6. 過去の記録のsource edit/lifecycleで同じshared primitivesを使う箇所

Phase Aでinteraction patternを完成させる。

### Phase B — measured expansion

before auditで同じlayout-shift / focus / feedback issueを実測した場合だけ展開。

- Knowledge Search
- Full Output
- Activity Analytics
- Entity Workspace
- Master
- 管理者ページ
- modal mutations

「app-wide」という理由だけで問題のないsurfaceを書き換えない。

## Acceptance tests from Web UX KB

Work0071は以下を主に採用する。

- T02 操作応答
- T03 全状態のCLS
- T04 キーボードと焦点
- T05 拡大・狭幅・入力機器
- T07 フォーム障害復旧
- T09 最大データ・応答順（対象surfaceのみ）
- T10 動き・ストリーミング（Knowledge Search等を変更した場合）
- T12 互換性・回帰（新CSS/APIを使う場合）

## Geometry acceptance

Core Web VitalsのCLSだけに依存しない。

user interaction後500ms以内の一部shiftはCLSから除外され得るため、primary action/action regionのbounding rectを直接比較する。

初期acceptance:

~~~text
PRIMARY_ACTION_SHIFT_X: <= 1 CSS px
PRIMARY_ACTION_SHIFT_Y: <= 1 CSS px
PRIMARY_ACTION_SIZE_CHANGE: <= 1 CSS px
UNEXPECTED_PAGE_SCROLL: 0
FOCUS_LOSS: 0
MATERIAL_STATUS_LAYOUT_JUMP: 0
~~~

比較状態:

~~~text
idle
file-selected / input-ready
validating
pending
success
validation-error
server-error
partial-success
retry-required
~~~

Viewport / interaction:

- desktop 1440px
- mobile 390px
- narrow 320 CSS px changed-surface smoke
- keyboard-only primary flow
- 200% text / high zoom changed-surface smoke where harness permits
- reduced motion

## Explicit defer / not applied by default

以下はGOOGLE-WEB-UX-KBに含まれるが、Work0071へ無条件に取り込まない。

- public landing / SEO optimization
- image/LCP optimization
- font loading tuning
- ad/embed optimization
- Worker導入
- content-visibility
- preload/prefetch
- bfcache/no-store changes
- new RUM collection
- analytics data送信
- provider/API streaming architecture

実測の症状、security/privacy判断、または別WorkのOutcomeがある場合だけ採用する。

## Evidence report format

Codex reportはGOOGLE-WEB-UX-KBのGUIDE-05をWork protocolへ合わせて使用する。

~~~text
目的・対象画面
採用rule IDs / reason / applies
今回適用しないrule IDs（重要なものだけ）
変更したsurface / primitive
before measurement
after measurement
keyboard/focus evidence
responsive evidence
error/retry evidence
not run / residual
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
BLOCKER
~~~

「Google ruleを採用した」ことと「この製品でUX改善を実測した」ことを分けて報告する。
