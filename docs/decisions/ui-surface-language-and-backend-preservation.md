# UI surface language and backend preservation

Current as of: 2026-09-05
Status: Accepted

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
| Inactivate / Deactivate | 削除 | 通常一覧・検索結果から見えなくする操作として扱う |
| Reactivate | 復元 | Inactive recordを再表示可能にする |
| Inactive | 削除済み | 管理・復元画面では状態を明確にする |
| Active | 使用中 / 表示中 / 省略 | 文脈に応じてtechnical statusを見せないことも可 |
| Index / indexing | 検索対象に追加 / 検索準備 | 通常利用者にprovider内部用語を要求しない |
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

## Normal-user vs administrator language

通常利用者のsurfaceではtask-oriented languageを優先する。

管理者surfaceでは、運用上の正確性が必要な場合に限り、Provider、Index、Active/Inactive、qualification等のtechnical termを残してよい。

同じ概念でも、通常利用者surfaceと管理者surfaceで表示文言が異なってよい。

## Functional choices must remain truthful

表示文言やvisual hierarchyは変更できるが、既存の実際の選択・処理を隠して別の機能に見せてはならない。

特に現在のChatGPT / Gemini / 全文出力はroute semanticsを持つため、単なるvisual redesignの中で自動統合・自動routingへ変更しない。そのような変更は別の明示的product decisionを必要とする。

## Implementation preference after design selection

選択されたデザインの実装は、可能な限り次を中心とする。

- `src/Index.html`;
- `src/Styles.html`;
- page HTML fragments;
- client-side HTML/JavaScript;
- label/copy/layout/navigation/presentation changes.

既存server facadeやbackend contractに変更が必要となる案は、原則として採用しない。

## Design gate

最初に複数のvisual mockを比較する。

- すべて同じ既存機能を表現する;
- 各案の違いは主にvisual hierarchy / navigation / density / wording / component presentationとする;
- mock選定前にproduction sourceを改修しない;
- userが方向性を選んだ後にのみ実装dispatchへ進む。

## Success condition

UI/UX改善の成功は、新しい機能数ではなく次で評価する。

- 初見でもactionの意味が分かる;
- technical implementation knowledgeなしで操作できる;
- 既存機能への到達が速い;
- 状態・結果・エラーが理解しやすい;
- AI回答と出典の関係が読みやすい;
- existing backend/runtime behaviorを壊さない;
- selected designがGAS HTML Service上で低リスクに実装できる。
