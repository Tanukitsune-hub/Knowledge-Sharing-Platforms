# Work 0071 CODEX-04 — Phase B focus continuity / edit recovery report

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Outcome / baseline

`origin/main` の `eec2d5e0261f06265fd5402397b5f73bf4bcf3b8` から指定 branch を作成した。Phase A の PR #104 / merge `e9c759c569660331a1eb447cd44787ab1051c427` の受入証拠は再判定していない。CODEX-01 の静的指摘をそのまま修正理由とせず、production HTML/client を使った隔離 synthetic browser で current main の操作前後を測定した。

Delivery: [Draft PR #105](https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/105)。ChatGPT 最終 review 待ち。

Work Contract: `BUILD`。目的は4つの Phase B 操作後の focus と編集エラーの修正。証拠順は実 Web App > exact production HTML の browser 操作 > deterministic check > 静的読解。source 変更は再現した material finding に限定し、server/API/schema/provider/permission/lifecycle 意味論と Phase A source は対象外。runtime mutation は source sync / immutable version / 既存 deployment update を各最大1回、target identity が確定しない場合は0回で停止。

## PHASE_B_AUDIT_RECHECK — current main の再現

| Finding | Classification | Browser before evidence | Decision |
|---|---|---|---|
| Activity Analytics admin-check | `REPRODUCED_MATERIAL` | error 後の再読込で focused checkbox が置換され、1440/390 とも `document.activeElement=BODY`。成功経路でも busy 中の native disabled で focus が落ちた。 | `meetingId` で復元し、消失時は集計 button へ fallback。正常成功では再描画しない。 |
| Master reorder | `REPRODUCED_MATERIAL` | 矢印移動は同じ option ID の control に戻り `ALREADY_SATISFIED`。reset/save 後は action が disabled となり、1440/390 とも `BODY`。 | 矢印の既存動作を維持し、reset/save 後だけ最後に移動した option ID の有効 control へ復元。 |
| Past News / Assessment edit validation | `REPRODUCED_MATERIAL` | 両 form で全必須欄が空の submit 後、inline error 0件、focus は `BODY`。client-invalid RPC は0件。 | Phase A の `kspSetInlineError` を再利用。 |
| Past Meeting / Pitchbook lifecycle | `REPRODUCED_MATERIAL` | 一覧の lifecycle button を keyboard 実行し、検索結果から対象行が消えると focus は `BODY`。 | record ID と元 row index を保持し、同一行・最寄り行・検索 button の順に復元。 |

観測は `tests/work0071-phase-b-browser.cjs` を修正前の `origin/main` source に対して実行した結果。1440/390 の両幅で同じ分類だった。静的監査だけによる分類ではない。

## Changes / after evidence

| Field | Result |
|---|---|
| `ANALYTICS_FOCUS` | synthetic browser 1440/390/320 PASS。成功時は同一 DOM checkbox と logical `meetingId` に focus、error reload は replacement の同一 ID、record missing は `activity-analytics-refresh`。成功時の余分な集計 RPC 0。1440/390/320 の error path の scrollY は各 `0→0` / `657→657` / `675→675`。 |
| `MASTER_REORDER_FOCUS` | 矢印 up/down、端行の disabled boundary、reset/save 後の option ID focus PASS。reset/save の button は clean state で disabled になるため、移動 item の有効 control へ戻る。reorder の synthetic mutation は1回で duplicate 0。drag/persistence 契約は変更なし。 |
| `PAST_SOURCE_INLINE_VALIDATION` | News/Assessment の Date、Title、Counterparty、Publisher/Assessment Type 全4欄に actionable inline message、`aria-invalid`、`aria-describedby`。first-invalid Date focus、修正後の field error 消去、draft Title 保持、client-invalid RPC 0 を browser で確認。server validation と DIRECT_TEXT/upload の意味論は変更なし。 |
| `PAST_LIFECYCLE_FOCUS` | Meeting 削除後に最寄り surviving row、空一覧では検索 button。Pitchbook は消失時の最寄り行、同一行が残る無効化/再有効化で replacement status action、空一覧では検索 button。detached node focus 0、390/320 の空一覧遷移でも page top への jump 0。確認 dialog と Active/Inactive の server contract は維持。 |
| `RESPONSIVE_1440` | production HTML browser の全 changed surface PASS。 |
| `RESPONSIVE_390` | 同上 PASS。 |
| `RESPONSIVE_320` | changed interaction の smoke PASS。root horizontal overflow 0。レイアウト CSS は変更なし。 |
| `KEYBOARD_FOCUS` | Space/Enter による Analytics checkbox、Master 移動/reset/save、Past edit submit、Meeting/Pitchbook lifecycle の readback PASS。 |

## Release / validation

production source freeze: `55bac220d4ea25d2c9f965fd0e8d504f0a0128f6`。`TARGET_RELEASE: 0.2.2`、`TARGET_SCHEMA: 9`。`dist/release-manifest.json` の source commit は freeze と一致し、bundle file SHA-256 は `02758480684b5e985182270fc73705b75b29592bef990ebfb4821beee79cc406`、payload SHA-256 は `082d25b097ad1bbc9a6071040e58d2cfc4fac9abcf649630a8d810a92b309415`。company 7-file `BASIS` はこの3値を独立 pin として更新した。7個の `.gs` を raw 連結した SHA-256 は bundle file hash と一致。

`LOGIC_VALIDATION: PASS`。focused browser `work0071-phase-b-browser.cjs` 1440/390/320 PASS、既存 `work0063-accessible-reorder-focus-browser.cjs`、`work0068-activity-analytics-browser.cjs`、`work0071-stable-interaction-browser.cjs` PASS。`python tools/validate_agent_foundation.py` PASS、`npm run check` **717/717 PASS**、bundle validator 67 server / 24 HTML PASS、company package `--check` PASS、`git diff --check` PASS。初回 canonical check の2件は旧 release hash literal と unit harness の DOM API 不足で、両方を exact candidate 用に更新し再実行で PASS。assertion は弱めていない。

`TARGET_RUNTIME_QUALIFICATION: NOT RUN — TARGET_IDENTITY_UNCONFIRMED`。現行セッションで既存の個人所有・隔離・owner-only Apps Script target の project / bound host / deployment entrypoint / execute-as / access / `/exec` を独立 readback できなかった。Apps Script 一覧の browser 経路は 404、現在の `clasp list` に該当 target は表示されなかった。過去 CODEX-02 の version 5 証拠は履歴として維持するが、今回の候補 source や現在の target identity の証明へ転用していない。target を推測して source sync や deployment update は行っていない。実 Web App の各 changed class の mutation/focus は未観測。

`SIDE_EFFECT_STATE: NONE`。source sync 0、immutable version 0、existing deployment update 0、new deployment/target 0。会社 production/data、provider/indexing/billing、permission、schema migration、trigger、physical delete の操作はすべて0。local synthetic browser のみで RPC は fake response。`USER_NATIVE_ACTION_COUNT: 0`。

`BLOCKER: TARGET_IDENTITY_UNCONFIRMED`。runtime-dependent Phase B acceptance は未完了。`FOLLOW_UP`: ChatGPT が Draft PR の source/配布物/ブラウザ証拠を review し、隔離 target の正しい identity / access chain を安全に再提示または確認できる場合のみ、新 Dispatch で bounded runtime qualification を判断する。`READY: NO`。Work0071 は `ACCEPTED` にせず Completion Latch も適用しない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002
NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
