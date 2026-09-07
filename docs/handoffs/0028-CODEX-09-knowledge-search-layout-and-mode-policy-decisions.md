# Work 0028 / CODEX-09 candidate — ナレッジ検索の配置・検索モード運用判断

WORK_ID: 0028
STATUS: CLOSED USER CORRECTION FOR NEXT DISPATCH
MODE: INVESTIGATION
SCOPE: DESIGN ONLY / PRODUCTION BEHAVIOR REQUIREMENT RECORDED

## User outcome

`ナレッジ検索`の検索条件を、日常的に使う条件から順に読みやすく再配置する。

また、検索モードは利用者が都度プロンプトを考える方式ではなく、`自由質問`以外は管理者が定義した固定質問／指示文を利用するpreset型とする。管理者は検索モードの表示選択肢と、それぞれに対応する固定質問／指示文を管理できるようにする。

## Current source reality

現行productionでは検索モードは以下5つの固定contractである。

- `自由質問`
- `要約`
- `時系列`
- `比較`
- `面談準備`

mode definition、prompt instruction、`比較`の2–5 Entity制約、`面談準備`のtarget requirement等はsourceに固定されている。現行の管理者ページはprovider、credential、model / Thinking policyを管理するが、検索モードの追加・削除・固定質問文編集UIは持たない。

したがって、今回の「管理者が検索モードを増減し、固定質問文を編集する」は現行機能の説明ではなく、新しいproduction behavior requirementである。

CODEX-09ではdesign-onlyとしてUI/interaction contractを確定し、`src/**` / `dist/**`は変更しない。実production化は後続BUILDでStrategy Resetして実装・検証する。

## Knowledge Search — final visible layout

検索条件cardの主要領域は上から3段構成とする。

### Row 1 — scope / period

左から次の順で1行に配置する。

1. `GP`
2. `情報ソース`
3. `開始日`
4. `終了日`
5. `全期間` checkbox

`情報ソース`の表示選択肢は既決定どおり次の3つ。

- `面談記録・資料` → underlying `sourceType = ''`
- `面談記録のみ` → underlying `sourceType = Meeting`
- `資料のみ` → underlying `sourceType = Pitchbook`

通常AI検索ではMeeting / Pitchbookの既存File Search、provider filter、citation / source identity contractを維持する。

`全文出力（AIを使わない）`では`情報ソース = 面談記録のみ`に固定する。Pitchbook本文・Pitchbook参照リンクは全文出力対象に含めない。

### Default period

通常の初期表示はrolling 3 yearsとする。

- `開始日`: 実行日から3年前
- `終了日`: 実行日
- `全期間`: OFF

`全期間`をONにした場合は開始日・終了日を検索条件から外し、date inputはdisabled / visually inactiveとする。

ONにする直前のdate valuesはclient stateで保持し、同一画面内でOFFへ戻した場合は復元する。`条件をクリア`ではrolling 3 yearsへ戻す。

日付のcanonical contract自体は既存の`dateFrom` / `dateTo`を維持する。production実装時の「今日」は既存temporal contractとtimezone方針に従い、browserの曖昧なlocal dateだけに依存しない。

### Row 2 — execution choice

左から次の順で配置する。

1. `検索モード`
2. `AIモデル`

現行のユーザー向け`使用モデル`というlabelは`AIモデル`へ改称する。

既存方針どおり、通常ユーザーへは管理者が許可したmodel/profileだけを1つのselectorに表示する。Thinking selectorは通常ユーザーへ表示しない。

`全文出力（AIを使わない）`を同じselector内のspecial optionとして残す場合も、AI providerへの自動fallbackは行わない。

### Row 3 — question / fixed instruction

`質問`欄をcard幅いっぱいに広く取り、現行より大きめのtextareaとする。

- `自由質問`: editable / required
- `自由質問`以外: read-only

非自由質問modeでは、管理者が当該modeに設定した固定質問／指示文をtextareaへ自動表示する。

視覚表現:

- textはmuted gray
- control backgroundもread-only stateと分かる淡いgray
- cursor / focusは利用可能だが文字変更不可
- `disabled`ではなく原則`readonly`を用い、内容確認・copy・accessibilityを損なわない

mode切替時は固定文言を即時反映する。自由質問へ戻した場合は自由質問用のユーザー入力draftを可能な範囲で復元する。

## Search mode policy — admin-managed preset registry

管理者ページに`検索モード設定`sectionを追加するdesignとする。

### Admin-visible fields

各modeについて最低限、次を管理できるようにする。

- 表示名
- 固定質問／指示文
- 有効 / 無効
- 表示順

管理者はpreset modeを追加できる。不要なpresetは通常利用者のselectorから外せる。

UI上は「削除」表現を使ってもよいが、production内部では設定履歴や参照整合性を壊さないようhard deleteよりInactive / disabledを優先する。

### Protected Free Question

`自由質問`はsystem baselineとして必ず残す。

- 削除不可
- 無効化不可
- textarea editable
- 管理者固定質問の対象外

表示名の変更可否はproduction BUILD時に決めるが、少なくともinternal stable IDは変えない。

### Existing special modes

現行の`比較`と`面談準備`はpromptだけでなく追加validation / UI behaviorを持つため、単純な文字列presetとして壊さない。

- `比較`: existing 2–5 Entity selection / validationを維持
- `面談準備`: existing target requirementを維持

`要約`、`時系列`等も既存prompt semanticsを初期presetとして移行できる。

管理者が新規追加するmodeは原則`GENERIC_PRESET` behaviorとし、固定質問／指示文だけを持つ。管理者が任意の新modeに`比較`や`面談準備`の特殊validationを自由付与する仕組みは今回の要件に含めない。

## Production integrity requirement

非自由質問modeの固定文言をclient側だけでreadonly表示する実装にはしない。

productionではserverがstable mode IDからauthoritative presetを解決し、実際のAI requestへ使う質問／指示文を決定する。clientから送られた非自由質問のtextはauthoritative inputとして信用しない。

これによりDevTools等でtextarea / payloadを書き換えても、管理者設定済みpresetを迂回できないようにする。

## Recommended persistence boundary for future BUILD

新しいsheet / databaseは必須にしない。

現行のmodel policyが`AI_Settings`上のJSON policyを利用しているのと同様に、検索モードregistryも既存設定基盤の新しいJSON policy keyとして保持する方法を第一候補とする。

例: `KNOWLEDGE_MODE_POLICY_JSON`

ただし具体的key名・schema・locking・migrationはproduction BUILDでsource review後に確定する。design-only CODEX-09でproduction contractを作り替えない。

最低限必要なregistry concept:

- stable `modeId`
- `displayName`
- `behaviorType`
- `fixedPrompt`
- `enabled`
- `sortOrder`

## Mode-specific UI compatibility

主要3段layoutは維持しつつ、特殊modeに必要な追加controlはcontextual areaとして表示してよい。

- `比較`選択時: existing 2–5 Entity selectorを表示
- `面談準備`選択時: existing target requirementを満たすためのEntity / GP guidanceを表示

これらを理由にRow 1–3の基本構成を崩さない。

既存のその他filter（面談先区分、面談先、Asset Class、Equity / Debt、Team、Fund / Strategy、要フォロー、関連GP、Meeting Type等）は`詳細条件`disclosureへ維持する。

## Preserve

- 通常AI検索のMeeting / Pitchbook sourceType、File Search、provider filter、citation / source identity
- user-visible Thinkingは表示しない
- no automatic provider fallback
- `全文出力（AIを使わない）`はMeeting原文のみ
- existing comparison / meeting-prep special semantics until a future explicit redesign
- Work 0027 Gemini qualified-disabled / normal-user hidden
- Work 0029 shared-admin session / password behavior
- current Light-only visual direction / 7 sidebar destinations / gold icon correction / Past Records relationship integration

## Acceptance evidence for CODEX-09 design correction

- Row 1が `GP / 情報ソース / 開始日 / 終了日 / 全期間`
- rolling 3 years defaultと`全期間`ON stateの双方をvisualize
- Row 2が `検索モード / AIモデル`
- Row 3にwide / larger `質問` textarea
- `自由質問`はeditable
- 非自由質問modeはgray read-only fixed prompt state
- 管理者ページに`検索モード設定`sectionのdesignを追加
- admin designでpresetの追加、無効化、表示名、固定質問／指示文、表示順を確認可能
- `自由質問`はprotected baselineとして表現
- `比較` / `面談準備`の既存特殊semanticsを失わない
- `情報ソース`選択肢が `面談記録・資料 / 面談記録のみ / 資料のみ`
- `全文出力（AIを使わない）`ではMeeting-only表示
- 1366×768 horizontal overflow 0
- production `src/**` / `dist/**` changes NONE

次にCodexへ実行指示を出す場合はfresh Dispatch ID `0028-CODEX-09`を使用し、Returned CODEX-08は再利用しない。
