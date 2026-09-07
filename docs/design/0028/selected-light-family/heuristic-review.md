# Heuristic review — A1.9 final Light correction

同じsynthetic fixtureとcurrent source contractで7つの代表scenarioを確認しました。Static mockから所要時間や利用者テスト成功率は作っていません。

| Scenario | Expected route / state | Visibility and hierarchy | Contract risk | Result |
|---|---|---|---|---|
| 1. 根拠付きKnowledge Search | ナレッジ検索 | Visible model selector 1件、Thinking/Geminiなし。回答→根拠不足→citation→原資料 | Tuple mappingはfuture frontend。自動failoverなし | PASS |
| 2. Meeting登録 | 記録を追加 → 面談 | 3-row form、inline quick add、3 Meeting Type checkbox visible | `meetingTypeCodes`、draft、handler、payloadは別契約 | PASS |
| 3. Pitchbook登録 | 記録を追加 → 資料 | Compact分類とfile surfaceを分離 | Pitchbook dataset、limits、partial retry維持 | PASS |
| 4. 過去資料maintenance | 過去の記録 → 資料 | Pitchbook専用filter/table。fileUrlありだけ原資料action | Meeting tableとcombinedにしない | PASS |
| 5. GP/non-GP確認 | 面談先サマリー | 1 selector row。選択に応じたspecialized content | Existing GP/Entity read facadeを維持 | PASS |
| 6. 月次実績確認 | 面談実績の集計 → 月次 | 対象月、summary、trend、breakdown、individual Meeting、確認済みを1 page | Existing analytics + admin check contract | PASS |
| 7. 管理 | プルダウンの管理 / 管理者ページ | Task-oriented label。Masterとshared-admin/provider semanticsを分離 | Internal IDs/auth/provider policy不変 | PASS |

## Heuristic judgment

- Recognition: Flat 8 destinationとtask labelでgroup headingの読み飛ばしを不要にした。
- Consistency: Sidebar activeは1件。Internal tab、checkbox、buttonにはgold/borderを使い、red stripを複製しない。
- Match with work: 月次個別確認を分析pageのmatching Meeting listへ統合し、month/date controlの重複を避けた。
- Error prevention: Meeting/Pitchbook dataset、GP/Entity facade、provider/admin contractをvisual consolidationで統合しない。
- Visibility: Chartとnumeric tableを同じrowに置き、傾向と数値を往復しやすくした。
- Recovery: `確認済み`は後からON/OFF可能なexisting flagとして示す。Record delete/restoreとは混同しない。
- Minimalism: Large KPI cardと独立monthly-management cardを置かず、3-item compact summaryとrow checkboxへ集約した。

Backend変更riskはNONEです。Month mapping、period-dependent controls、row checkbox wiring、facade routing、details disclosureはsmall frontend behaviorを伴うため、production実装時にkeyboard/focus/runtime/persistenceを確認します。
