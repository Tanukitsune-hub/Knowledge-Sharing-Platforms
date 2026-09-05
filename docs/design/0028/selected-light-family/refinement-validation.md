# CODEX-05 refinement validation

BASE_MAIN_SHA: `1a6966beae11e6b0d1e9744e78333ee925fce662`

BASE_LIGHT_PR41_SHA: `46d16b46535239e2ce91f7d6bf362836bfaf9985`

Viewport: CSS `1366 × 768`

## Render coverage

`render-design.py`で18のinert HTML referenceと各captureを再生成しました。全pageをbrowserでrenderし、console warning/errorがないことを確認しました。

| Check | Result |
|---|---|
| visual pages render | PASS / 18 of 18 |
| horizontal page overflow | PASS / 0 of 18 |
| active sidebar destination | PASS / exactly 1 per page |
| sidebar computed base | PASS / `rgb(24, 33, 36)` = `#182124` |
| ordinary element `#E1001F` usage | PASS / 0 per page |
| active left-strip pseudo-element | PASS / exactly 1 per page |
| sidebar icons | PASS / 11 local SVG icons per page |
| sayagata computed repeat | PASS / `92px 92px` |
| page computed background | PASS / `rgb(244, 247, 250)` = `#F4F7FA` |
| browser console warning/error | PASS / 0 |

`clientWidth`と`scrollWidth`は各pageで一致しました。Scrollbar有無により値は1351または1366でしたが、page横overflowはありません。

GitHub preview用の18 captureは1280×720 browser surfaceで再取得し、ここでも`scrollWidth <= clientWidth`、active destination各1を確認しました。

## Contract-specific browser observations

| Surface | Observation | Result |
|---|---|---|
| Knowledge Search | visible `使用モデル` selector 1個。optionsは`GPT-5.6 Luna`と`全文出力（AIを使わない）` | PASS |
| Knowledge Search | visible `Thinking`なし、visible `Gemini`なし | PASS |
| Meeting registration | row field counts `[3, 2, 3]` | PASS |
| Meeting edit | row field counts `[3, 2, 3]` | PASS |
| Pitchbook classification edit | 日付 / GP / Asset Class / Equity/Debtの4 fieldが同じtop位置、file input 0 | PASS |
| GP Workspace | `GPを選択`と`印刷 / PDF`が同じrow | PASS |
| GP Workspace | headline summaryは`面談 1件` / `資料 2件` / `最終面談日 2026-09-03`だけ | PASS |
| Past Pitchbook | `fileUrl`相当のある2行だけ`原資料を開く`、source欠落行のaction 0 | PASS |
| AI Provider Settings | admin Thinking policy controlがvisible | PASS |

## Combined visual comparison

ユーザー添付referenceと最終Knowledge Search captureを同じcomparison surface、同じreview contextで並べて確認しました。固定されたsidebar/shell/gold/active cueを維持しつつ、指定されたcool slate、single model selector、local icon、dense sayagata、vertical compactionが反映されています。

初回refinement後に見つかった通常利用者向けhelper textの内部語彙だけを1回修正し、全pageを再render/captureしました。Correction budgetは`1 / 1`です。

## Evidence boundary

これはdeterministic static design referenceの検証です。keyboard、focus behavior、contrast実測、screen reader、custom dialog behavior、Apps Script runtime、provider、server mappingのPASSは主張しません。
