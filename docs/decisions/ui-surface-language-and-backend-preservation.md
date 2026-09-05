# UI surface language and backend preservation

Current as of: 2026-09-05
Status: Accepted policy; visual design not yet selected

## Decision

Knowledge Shareの次のUI/UX改善は、既に組み上がっているシステムを大幅改修するためのWorkではない。

目的は、既存機能を維持したまま、画面デザイン、情報配置、操作導線、表示文言、状態表示、確認ダイアログ等を改善し、通常利用者にとって分かりやすく使いやすい表層へ整えることである。

原則として、Backend、データ構造、既存のサーバー処理、Provider adapter、検索契約、AI契約、lifecycle、installer/distribution契約は変更しない。

## Preservation boundary

Work 0027までに受け入れられた実装・証跡を基準とする。

UI/UX改善では、原則として次を維持する。

- Google Workspaceを正本とする構造;
- 既存の5-sheet Backend;
- stable IDs / current metadata contracts;
- Meeting / Pitchbook registration and maintenance semantics;
- Active / Inactive / Reactivate lifecycle;
- ChatGPT / Gemini / 全文出力の既存route semantics;
- provider-specific safe error / no cross-provider failover;
- current Knowledge Search modes, filters, citations and source identity;
- existing administrator policy and authorization boundaries;
- modular source -> generated bundle -> installer distribution path.

デザイン案のためだけに、新しいsheet、database、API、provider、index、relation model、migration、background job、server-side workflowを追加しない。

## User-facing language may differ from internal implementation terms

通常利用者向けUIでは、内部実装名よりも「ユーザーが何をしたいか / 操作後に何が起きるか」を優先して表示する。

内部のtechnical termと画面表示を同一にする必要はない。

Examples:

| Internal semantics | Preferred user-facing language | Notes |
|---|---|---|
| Inactivate / Deactivate | 削除 | 通常一覧・検索結果から見えなくするrecord操作として扱う |
| Reactivate | 復元 | eligible Inactive recordを再表示可能にする |
| Inactive | 削除済み | recordの管理・復元画面では状態を明確にする |
| Active | 使用中 / 表示中 / 省略 | 文脈に応じてtechnical statusを見せないことも可 |
| Index / indexing | 検索対象に追加 / 検索準備 | 実際の処理・表示箇所を確認してから採用する |
| File Search | ナレッジ検索 / 資料を検索 | route/providerの意味を変えない範囲 |
| Processing | 処理中 / 読み込み中 | 実際の操作に合わせる |

### 「削除」の扱い

物理削除を実装していなくても、通常利用者が期待する結果が「その項目を通常画面から消す」であれば、表面上のaction labelは「削除」としてよい。

ただし、完全消去と誤解することが重要な場面では、確認ダイアログ等で実際の意味を明示する。

推奨例:

```text
このナレッジを削除しますか？
削除後は通常の一覧・検索結果に表示されなくなります。データは保持され、必要に応じて復元できます。
```

ボタン表示を「非アクティブ化」に戻すことで正確性を担保するのではなく、ユーザー向けaction labelと必要な補足説明を組み合わせる。

実際の復元条件、削除済み/すべて表示時の挙動、保持される既存の関連リンクはそのまま維持する。元のGoogle Docs/Driveファイルの完全消去や閲覧権限剥奪は約束しない。Masterの選択肢除外とknowledge recordの削除は、同じ内部状態でも文脈を分ける。

## Normal-user vs administrator language

通常利用者のsurfaceではtask-oriented languageを優先する。

管理者surfaceでは、運用上の正確性が必要な場合に限り、Provider、Index、Active/Inactive、qualification等のtechnical termを残してよい。

同じ概念でも、通常利用者surfaceと管理者surfaceで表示文言が異なってよい。

用語一覧は `現在の実表示 -> 推奨ユーザー表示 -> 管理者/内部表示 -> 理由・source` として作る。実表示を読まず、候補表だけを機械的に適用しない。HTML optionの表示文字が暗黙の送信値になっている場合は、従来の明示的なvalueを固定してから翻訳する。

## Functional choices must remain truthful

表示文言やvisual hierarchyは変更できるが、既存の実際の選択・処理を隠して別の機能に見せてはならない。

特に現在のChatGPT / Gemini / 全文出力はroute semanticsを持つため、単なるvisual redesignの中で自動統合・自動routingへ変更しない。そのような変更は別の明示的product decisionを必要とする。

現在のqualified-disabled Gemini状態を変更しない。有効時の既存機能をモックで説明する場合は、現行状態とは別のpolicy fixtureと明示する。Model/thinking controlの表示整理も、管理者policyとserver validationを維持する。

## Light / Dark / System — accepted extension

2026-09-05のユーザー方針に基づき、個々の利用者が表示テーマを選べるfrontend-only方式を採用する計画とする。

- 選択肢は `システム設定に合わせる / ライト / ダーク`。
- 初期値はsystem。ブラウザが報告する `prefers-color-scheme` を利用し、取得できない場合はLightへ安全にfallbackする。
- 明示的なLight/Dark選択を優先する。system選択中だけsystem変更へ追従する。
- 保存対象はテーマ選択のみ。ブラウザprofile/origin/storage contextに依存するlocal設定であり、Googleアカウントや別端末への同期を約束しない。
- 既存24時間draft保存とは別のkey/寿命を使う。保存拒否時もアプリを止めず、現在ページでの切替は維持する。
- テーマのためのsheet、UserProperties、database、認証、API、backend persistenceは追加しない。
- Light段階からsemantic CSS tokensを用意する。Darkではlayoutや機能を変えず、色役割と状態表示を検証する。
- 切替でdraft、入力、query token、選択providerを失わず、再読込やAPI再実行を発生させない。
- 印刷はLightを維持し、全文出力のcanonical package/Copy/Docs/PDF内容は変更しない。

これは表示機能の追加に対する合意であり、production実装開始の許可ではない。詳細、一次資料、検証matrixは `docs/planning/work0028-ui-ux-and-theme-plan.md` を参照する。

## Implementation preference after design selection

選択されたデザインの実装は、可能な限り次を中心とする。

- `src/Index.html`;
- `src/Styles.html`;
- page HTML fragments;
- client-side HTML/JavaScript;
- label/copy/layout/navigation/presentation changes.

既存server facadeやbackend contractに変更が必要となる案は、原則として採用しない。Theme保存やdisclosure等のclient behaviorはCSS-onlyと区別して検証する。Native confirmの独自配色や新しいcitation mappingなど、表示だけでは実現できない要素は明示する。

## Design gate

まずA/B/CのLight visual mockを同じ機能・synthetic content・用語・policy state・viewportで比較する。

- 各案の差はvisual hierarchy / navigation / density / component presentationを中心とする;
- 現行画面・用語のinventoryをsourceに基づき作る;
- mock選定前にproduction sourceを改修しない;
- ChatGPTが調査・比較・推奨を担い、ユーザーに専門的な設計作業を要求しない;
- userがLight方向性を選択した後、選択案のDark mockを作る;
- hybridは既に比較した要素の組合せに限定し、新しい機能・navigation modelを追加しない;
- selected Light/Dark designの承認と明示的な実装許可が揃った後にのみ実装dispatchへ進む;
- deploymentは引き続き別途明示scopeで許可を得る。

外部ユーザーテストは前提とせず、同じ7シナリオによるheuristic reviewを用いる。これは実利用者による検証やtarget-runtime qualificationと同一ではない。

## Success condition

UI/UX改善の成功は、新しい機能数ではなく次で評価する。

- 初見でもactionの意味が分かる;
- technical implementation knowledgeなしで操作できる;
- 既存機能への到達が速い;
- 状態・結果・エラーが理解しやすい;
- AI回答と出典の関係が読みやすい;
- Light/Darkともに読みやすく、利用者が無理なく切り替えられる;
- existing backend/runtime behaviorを壊さない;
- selected designがGAS HTML Service上で低リスクに実装できる。
