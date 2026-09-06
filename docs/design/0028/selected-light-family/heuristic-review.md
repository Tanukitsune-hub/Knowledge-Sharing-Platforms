# Heuristic review — A1.8 consolidated navigation

同じsynthetic fixtureとcurrent source contractで7つの代表scenarioを確認しました。Static mockから所要時間や利用者テスト成功率は作っていません。

| Scenario | Expected route / state | Visibility and hierarchy | Contract risk | Result |
|---|---|---|---|---|
| 1. 根拠付きKnowledge Search | 探す → ナレッジ検索 | 主操作が明確。visible model selector 1件、Thinking/Geminiなし。回答→根拠不足→citation→原資料の順 | tuple mappingはfuture frontend。自動failoverなし | PASS |
| 2. 月次Meeting確認 | 探す → 面談履歴 → YYYY-MM | chart/KPIを置かず、対象月→individual Meeting tableをfirst viewに配置 | existing date rangeまたはmonthly+drillを再利用 | PASS |
| 3. Meeting登録 | 記録する → 記録を追加 → 面談 | 3-row form、inline quick add、3 Meeting Type checkbox visible。長文はlower full-width | meetingTypeCodes、draft、handler、payloadは別契約 | PASS |
| 4. Pitchbook登録 | 記録する → 記録を追加 → 資料 | 同じ入口だが分類とfile surfaceは明確に分離 | Pitchbook dataset、file limits、partial retryを維持 | PASS |
| 5. 過去資料のmaintenance | 振り返る → 過去の記録 → 資料 | Pitchbook専用filter/table。fileUrlありだけ原資料action。delete/restoreを区別 | Meeting tableとcombinedにしない | PASS |
| 6. GP review | 振り返る → Workspace、対象区分=GP | 1 selector row、3-item summary、Fund/Meeting/Pitchbook/relationship | getGpWorkspaceDataを維持 | PASS |
| 7. Non-GP review | 振り返る → Workspace、対象区分=非GP | Fund drill、direct/related、linked material、Meetings、Mixes/Follow-ups、relation、timeline | getEntityWorkspaceDataを維持 | PASS |

## Navigation heuristics

- Recognition: 9 destinationのtask-oriented labelへ縮約し、Meeting/Pitchbookの選択は画面内で行う。
- Consistency: sidebar activeは1件。内部tab currentはgold/borderで示し、赤stripを複製しない。
- Match with user intent: 面談履歴は個別確認、面談活動の集計は分析として分離する。
- Error prevention: 記録を追加と過去の記録でMeeting/Pitchbookのdatasetを別surfaceに保つ。
- Visibility: Workspace selectorは対象区分 / 対象 / 印刷-PDFを同rowに置く。二重のGP/non-GP tabは置かない。
- Recovery: record deleteは保持/復元可能と説明し、sourceなしPitchbookにactionをfabricateしない。
- Minimalism: PR #42のcompact densityを維持し、top-level destination、KPI card、duplicate selectorを増やさない。

Backend変更riskはNONEです。Internal tab、month-to-date mapping、Workspace facade routing、details disclosureはsmall frontend behaviorを伴うため、production実装時にkeyboard/focus/runtime確認が必要です。
