# Work 0060–0065 — UX hardening roadmap

STATUS: PLANNED
ROUTING_BASELINE: GitHub main after Work0059
SOURCE_REVIEW: Product-wide UX review based on current main and accepted Work0053–0059 evidence

## Objective

Private Assets Intelligenceの既存機能・情報設計を維持しながら、日常利用での「入力を失わない」「結果を取り違えない」「迷わず修正・操作できる」を改善する。

新機能追加や全面 redesign は行わず、今回のレビューで妥当と判断した5テーマを独立したWorkに分け、最後に必要なら1回だけtarget runtimeへ反映・確認する。

## Sequence

| Work | Theme | Priority | Mode | Validation Tier | Main reason |
|---|---|---|---|---|---|
| 0060 | 編集中内容の保護・編集対象の明示 | HIGH | BUILD | TIER_2_STANDARD | 入力消失を最優先で防ぐ |
| 0061 | 検索・サマリーのresult freshness / stale state | HIGH | BUILD | TIER_2_STANDARD | 条件と表示結果の取り違えを防ぐ |
| 0062 | 必須入力のfield-level validation | MEDIUM | BUILD | TIER_2_STANDARD | 修正箇所を即座に理解できるようにする |
| 0063 | drag代替操作とfocus/navigation改善 | MEDIUM | BUILD | TIER_2_STANDARD | mouse / touch / keyboardで操作を完結させる |
| 0064 | 補助文字contrastとTheme警告の補強 | MEDIUM | BUILD | TIER_2_STANDARD | 読みやすさを改善し将来の低contrast設定も検知する |
| 0065 | accepted UI improvementsのtarget-runtime release | CONDITIONAL | QUALIFICATION | TIER_3_HIGH | 0060–0064を実利用版へ1回で反映する場合のみ |

Work0060–0064は原則mainへ個別mergeする。各Workで証拠作成だけのdeployは行わず、runtime固有の反証がない限りlocal / deterministic / relevant browser evidenceで受入れる。実利用Web Appへの反映はWork0065へ集約し、ユーザーの明示承認後に行う。

---

## Work0060 — Unsaved edit protection

### Primary Outcome

「過去の記録」の面談編集で、入力途中の内容が意図せず消えたり、現在見ている記録と編集中の記録を取り違えたりしない。

### Required Scope

- 面談編集フォームの初期snapshotとdirty stateを管理する。
- 実際に編集内容を破棄する操作だけで確認する。
  - 「編集を終了」
  - 別の記録を編集対象として読み込む
  - 詳細の「選択解除」等で編集stateもresetされる場合
- 単なるpage navigationで編集DOM/stateが保持される場合は不要な確認を出さない。
- 編集中の対象（Meeting ID、面談先、日付等）を現在より明確に表示する。
- 保存成功後はdirty stateを新しい保存済みsnapshotへ更新する。
- server concurrency / expectedVersion contractは維持する。

### Non-Goals

- 新規面談登録のdraft設計変更
- autosaveをserverへ追加
- schema / API変更
- 編集画面の全面 redesign

### Acceptance Evidence

- 変更なしで「編集を終了」→確認なしで終了可能。
- 変更ありで破棄につながる操作→確認あり。
- cancel→入力内容と編集対象を維持。
- confirm→reset / 別recordへの切替が正しく行われる。
- save成功後→破棄確認なしで終了可能。
- detail recordとedit recordが異なる状態でも「何を編集中か」が分かる。
- focused tests + 過去の記録 desktop / 390 relevant browser。
- canonical check 1回。
- unrelated pages / provider / deployment regressionは行わない。

### Recommended model

GPT-5.6 Luna Max。仕様が明確で局所的なclient state変更のため。

---

## Work0061 — Result freshness and request coherence

### Primary Outcome

利用者が変更した「現在の質問・条件・面談先」と、画面に表示される回答・サマリーが常に対応していることを明確にする。

### Scope A: Knowledge Search

- query fingerprintへ質問／追加指示を含める。
- 実行開始時の条件snapshotを保持する。
- 質問・filter・mode等を変更したら、既存回答を「前の条件の結果」として明確にstale化するか非表示にする。
- response / poll resultをcurrent request identityと照合し、古いresponseをcurrent resultとして描画しない。
- pending queryのresume semanticsを維持する。
- result scopeには必要十分な実行時条件を示す。

### Scope B: Entity Workspace

- 面談先変更直後に旧entityのcontentを新entityの内容として見せない。
- loading中は選択した対象を明確にする。
- load failure時も旧対象のcontentとの関係を誤認させない。
- 既存requestSequenceによるout-of-order protectionを維持・補強する。

### Non-Goals

- AI provider logic変更
- prompt / retrieval quality改善
- provider callを使ったqualification
- Entity Workspaceの情報設計変更

### Acceptance Evidence

- Question A結果表示後にQuestion Bへ変更→A結果がcurrent resultに見えない。
- 遅いA responseが、後から実行したBの結果を上書きしない。
- pending query再開時もrequest identityが一致する場合のみcurrentとして表示。
- Entity A→B切替中・失敗時にA contentをBと誤認しない。
- focused async/race tests + Knowledge Search / Entity Workspace relevant browser。
- canonical check 1回。
- provider call 0で検証可能な範囲を優先。

### Recommended model

GPT-5.6 Sol High。async request state・polling・resume・複数画面のstate coherenceを扱うため。

---

## Work0062 — Field-level validation

### Primary Outcome

面談登録・面談編集で、送信できない理由と修正すべき項目を利用者が即座に理解できるようにする。

### Required Scope

- 現在のrequired fields（日付、面談先、アセットクラス等）を正本として扱う。
- invalid fieldに`aria-invalid`と近接した日本語error messageを表示。
- submit時に最初のinvalid fieldへfocusする。
- 必要ならform上部に短いsummaryを置くが、同じ文言を過剰に重複させない。
- 入力後はfield errorを適切なタイミングで解除。
- 既存Quick Add modalの「具体的なerror + focus」patternを再利用。
- server-side validationは維持し、client validationで置き換えない。

### Non-Goals

- 全fieldへの複雑なvalidation追加
- native browser validationへの全面移行
- schema / required-field policy変更

### Acceptance Evidence

- 1項目欠落→その項目を具体的に示しfocus。
- 複数欠落→全invalid fieldが判別できる。
- 修正後→error state解除。
- 入力値は保持。
- registration / editの双方で一貫したpattern。
- focused tests + relevant browser + canonical check 1回。

### Recommended model

GPT-5.6 Luna Max。

---

## Work0063 — Accessible reorder and focus flow

### Primary Outcome

ドラッグが使えない利用者でもマスターの並び替えを完結でき、画面・詳細・編集の切替後にkeyboard focusが意味のある場所へ移る。

### Required Scope

#### Master reorder

- drag & dropは維持する。
- 各rowに「上へ」「下へ」等のsingle-pointer / keyboard-compatible alternativeを提供。
- 同じdraft order stateを使い、別の並び替えmechanismを新設しない。
- first / last rowでは不要な操作をdisable。
- reorder後も操作対象付近へfocusを維持する。

#### Focus flow

- nav buttonでpageを切り替えた場合、keyboard利用時に新pageのheading / primary regionへ移動できる。
- detail / editを開いてscrollするflowでは、表示位置だけでなく操作focusも意味のあるheading/controlへ移す。
- modalの既存focus trap / return behaviorは維持。

### Non-Goals

- navigation IA変更
- dragの廃止
- screen-reader適合全体の再認定
- 全DOMへのtabindex追加

### Acceptance Evidence

- mouse dragなしで並び替え→save可能。
- keyboardだけでも同じ操作を完了可能。
- focus lossやbody先頭への不自然な移動なし。
- page/detail/editの主要遷移でfocus destinationが確認できる。
- focused accessibility tests + relevant browser。
- canonical check 1回。

### Recommended model

GPT-5.6 Luna Max。実装は局所だがbrowser interaction確認を重視。

---

## Work0064 — Secondary text contrast

### Primary Outcome

既定Themeで小さい補助文字が通常文字のcontrast要件を満たし、Theme設定でも同種の低contrast組み合わせを警告できるようにする。

### Required Scope

- `text.secondary`の既定色を、既定のcard/page/surface背景すべてに対して通常文字4.5:1以上となる最小変更へ調整する。
- 現在のNavy / Slate visual identityを維持する。
- Theme contrast warningへ`text.secondary`の主要背景pairを追加する。
- custom saved Themeをmigration / overwriteしない。
- warningは保存blockingにせず、現行のwarning semanticsを維持する。

### Non-Goals

- 16色token体系の再設計
- Theme UI redesign
- WCAG全項目のformal certification
- user-saved theme migration

### Acceptance Evidence

- default `text.secondary`が主要背景で4.5:1以上。
- current primary text / button contrastを悪化させない。
- intentionally low-contrast custom previewでwarning表示。
- accepted Work0055 color-tool behavior維持。
- focused contrast tests + Theme browser 1440 / 390。
- canonical check 1回。

### Recommended model

GPT-5.6 Luna Max。

---

## Work0065 — Conditional target-runtime release

### Trigger

Work0060–0064がmainへaccepted/mergedされ、ユーザーが実利用Web Appへの反映を明示承認した場合のみ開始する。

### Primary Outcome

0060–0064のaccepted sourceを、既存の同一owner-controlled Web Appへ1回で反映し、主要変更面だけをtarget runtimeで確認する。

### Boundaries

- same existing deploymentのみ更新。
- new deployment 0。
- data migration 0。
- provider callは0061のUI/state qualificationに不要なら0。
- business data mutationは原則0。必要なruntime interactionはisolated / non-mutating pathを優先。
- 0060–0064でaccepted済みのlocal evidenceを再び全面的にやり直さない。

### Target-runtime matrix

確認対象は変更したflowに限定:
- 過去の記録: edit dirty protection
- Knowledge Search: stale/current result state（provider call不要な範囲）
- 面談登録 / edit: field-level validation
- Master reorder / focus
- Theme default / warning
- 390pxの主要変更面でmaterial layout regressionなし

### Completion

1 source sync + 1 immutable version + 1 existing deployment updateを上限とし、required matrix PASS後にCompletion Latch。

---

## Cross-Work Constraints

- Work0053–0059のaccepted結論を重大な反証なしに開かない。
- current navigation / information architectureを維持。
- management page access modelを変更しない。
- KSP namespace、resource names、schema、API、property keyを変更しない。
- 新機能を追加して問題を解決しない。既存flowのhardeningを優先。
- 各Workは選択したValidation Tierの範囲だけ検証し、過去Work全件のregressionを習慣的に追加しない。
- 0060–0064の各PRは独立してreview / rollback可能にする。
- あるWorkで別Workの実装が必要だと判明した場合はscopeを拡張せず、依存を記録して順番を調整する。

## Stop Rule

各WorkはAcceptance Evidenceを満たした時点で、関連diff / consistency reviewを1回行い停止する。別テーマの「ついで修正」は次Workへ送る。
