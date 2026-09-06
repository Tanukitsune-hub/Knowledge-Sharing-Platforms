# Visual errata and accepted deviations — A1.8

この文書はPR #42 visual baseline、current source、CODEX-06のconsolidation差を固定します。Generated visualの文字やcontrolはsource contractより下位です。

## 維持するPR #42 baseline

- sidebar #182124、main #F4F7FA、white card、cool border、restrained gold。
- local Lucide thin-line icon、19px、外部runtime dependencyなし。
- clean sayagata、92px repeat、lower-leftからupper-rightへfade。
- #E1001Fはactive sidebar左stripだけ。
- Knowledge Searchはvisible model selector 1件、normal-user Thinking/Geminiなし。
- Meeting/Pitchbook/GPのcompact layout、future Dark chart LIGHT_FIXED。

## Reintroducedしないもの

- separate top-level 面談追加 / 資料追加。
- separate top-level 過去Meeting / 過去Pitchbook。
- separate GP Workspace / Entity Workspace sidebar destination。
- MeetingとPitchbookのcombined tableまたはdataset。
- 投資performance KPI、network graph、新provider、新dataset、新backend endpoint。
- Home、notification、avatar/account menu。
- file replacement、app内preview、download専用action。
- Visible Active KPI、headline要フォロー件数。
- normal-user ThinkingまたはGemini。
- source URLがないrowの原資料action。

## Label / control correction

| Current source | Recommended visible label | Preserved value / behavior |
|---|---|---|
| 面談記録 / Pitchbook | 記録を追加 → 面談 / 資料 | separate form/draft/handler/payload |
| 過去面談 / 過去資料 | 過去の記録 → 面談 / 資料 | separate filters/tables/datasets |
| GP Workspace / Entity Workspace | Workspace | existing GP / Entity public facades |
| 定例年1回 | 年1面談 | ANNUAL_REVIEW |
| 先方オフィス訪問 | オフィス訪問 | OFFICE_VISIT |
| 年次総会 | 年次総会 | ANNUAL_GENERAL_MEETING |
| Pitchbook 開く | 原資料を開く | fileUrlありのみ、new browser tab |
| 専用destinationなし | 面談履歴 | existing date range or monthly+drill |

## Targeted correction round

Initial combined comparisonではWorkspace上部にGP / 非GP Entityのinternal tabと対象区分selectorが重複していました。これは判断controlの重複と縦space増加になるP2 findingでした。1回のtargeted correctionでinternal tabを削除し、対象区分 / 対象 / 印刷-PDFの1 rowだけへ戻しました。

Post-fix comparisonではPR #42の色、密度、icon、sayagata、GP compact contentを維持しつつ、selectorの3 control bottomが同一lineで、duplicate target controlが0件です。追加iterationは行っていません。

## Static artifact boundary

HTMLはdesign-only referenceです。Production handler、mapping、save、authentication、provider、runtimeは実装していません。Keyboard、focus、contrast実測、screen reader、Apps Script renderのPASSは主張しません。
