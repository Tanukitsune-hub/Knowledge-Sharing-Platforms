# Heuristic review — A1.10 Light-only final polish

同じsynthetic fixtureとcurrent source contractで7つの代表scenarioを確認しました。Static mockから所要時間や利用者テスト成功率は作っていません。

| Scenario | Expected route / state | Visibility and hierarchy | Contract risk | Result |
|---|---|---|---|---|
| 1. 根拠付きKnowledge Search | ナレッジ検索 | Visible model selector 1件、Thinking/Geminiなし。回答→根拠不足→citation→原資料 | Tuple mappingはfuture frontend。自動failoverなし | PASS |
| 2. Meeting/Pitchbook登録 | 記録を追加 → 面談/資料 | 3-row Meeting、inline quick add、3 Meeting Type、compact Pitchbook分類 | Form/dataset/handler/payloadは別契約 | PASS |
| 3. 過去Meetingと関連資料 | 過去の記録 → 面談 | `関連資料 n件`からresolved / Inactive / unresolvedを一覧内確認 | Explicit Document IDsのみ。Mutationなし | PASS |
| 4. 過去資料と関連面談 | 過去の記録 → 資料 | `関連面談 n件`からdate/counterparty/type/strategy/sourceを確認 | 明示参照Meetingだけ。GP一致推定なし | PASS |
| 5. GP/non-GP確認 | 面談先サマリー | 1 selector row。選択に応じたspecialized content | Existing GP/Entity read facadeを維持 | PASS |
| 6. 月次実績確認 | 面談実績の集計 → 月次 | 対象月、summary、trend、breakdown、individual Meeting、確認済みを1 page | Existing analytics + admin check contract | PASS |
| 7. 管理 | プルダウンの管理 / 管理者ページ | Gold separator後のsystem/tool領域。Masterとshared-admin/provider semanticsを分離 | Internal IDs/auth/provider policy不変 | PASS |

## Heuristic judgment

- Recognition: 7 destinationのtask labelとgold separatorで、text headingを増やさず通常業務とsystem/toolの境界を示した。
- Consistency: Sidebar activeは1件。Internal tab、checkbox、buttonにはgold/borderを使い、red stripを複製しない。
- Match with work: RelationshipをPast Recordsの該当row/detailへ統合し、別pageへ移動する負荷を減らした。
- Error prevention: Explicit Document IDを関係の正本として表示し、Inactive/unresolvedやsource action absenceを隠さない。
- Visibility: Chartとnumeric tableを同じrowに置き、傾向と数値を往復しやすくした。
- Recovery: `確認済み`は後からON/OFF可能なexisting flagとして示す。Record delete/restoreとは混同しない。
- Minimalism: Standalone relationship destination、large KPI card、独立monthly-management cardを置かない。

Backend変更riskはNONEです。Month mapping、period-dependent controls、row checkbox wiring、facade routing、details disclosureはsmall frontend behaviorを伴うため、production実装時にkeyboard/focus/runtime/persistenceを確認します。
