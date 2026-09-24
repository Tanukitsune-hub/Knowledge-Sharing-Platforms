# Work 0061 CODEX-01 — result freshness

WORK_ID: 0061
DISPATCH_ID: 0061-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Outcome

Knowledge Searchのquery identityに`questionOrInstruction`を含め、request開始時のfingerprintとsequenceを保持するようにした。質問・mode・filter・面談先・model・thinkingの変更時に旧回答をhiddenにし、開始responseとpending pollの遅延responseは現在のpayload identityと一致する場合だけ描画する。pending queryのsessionStorage復帰も保存fingerprintと現在のpayloadが一致する場合に限る。fingerprintは質問本文を含むidentityから算出するが、保存値に質問本文を残さない。

Entity Workspaceは面談先の選択時に前のcontentとprintを即時無効化し、読み込み中・失敗時のstatusに対象名を表示する。responseは既存`entityWorkspaceRequestSequence`に加えて選択中のentity keyとも照合する。Fund / Strategyの切替中は前のdrillを消し、遅延responseが新しい選択を上書きしないようにした。

provider server logic、prompt、retrieval、billing、schema、API contract、navigation IA、AI検索mode定義は変更していない。Work0060の実装も変更していない。

## Evidence

| 項目 | 結果 |
|---|---|
| focused logic/UI | `node --test tests/work0061-result-freshness.test.cjs tests/ai-query-ui.test.cjs tests/entity-workspace-ui.test.cjs`: 20/20 PASS。質問差異、遅延開始response、無効化後のpoll、pending resume、一致query、Entity A→B race/failure、Fund / Strategy切替を確認 |
| relevant browser | `node tests/work0061-result-browser.cjs`: production HTML/CSS/client sourceと合成RPCでKnowledge Search・Entity Workspaceを1440px/390pxで操作。両viewportともPASS、横はみ出し0、page/console error 0。質問変更、遅延response/poll、A→B loading/failure/race、Fund / Strategyを確認 |
| bundle | `npm run build:bundle`後、`npm run check:bundle`: 30/30 PASS。生成物のsource commitは`626699b` |
| canonical | `npm run check`: 1回、681/681 PASS |
| diff | `git diff --check`: PASS。変更対象はclient source、focused tests、生成bundle、本report、dispatchのみ |

browser screenshotsは作業端末の`%LOCALAPPDATA%\Temp\ksp-work0061-result-browser\`に保存した。browserのRPCは合成応答のみで、provider callはない。

## Completion boundary

- `LOGIC_VALIDATION`: PASS
- `TARGET_RUNTIME_QUALIFICATION`: NOT RUN（実利用Web Appへのdeployment・動作確認は本Dispatchのscope外）
- `SIDE_EFFECT_STATE`: provider call、deployment、business-data mutation 0
- `BLOCKER`: 本Dispatchのlocal acceptanceに対してNONE
- `READY`: ChatGPT final reviewに提出可能。target-runtime READYは未判定
- `WORK_0061_COMPLETE`: NO
- `COMPLETION_LATCH`: NOT_APPLIED

## Shared Knowledge

- `KNOWLEDGE_RETRIEVAL`: RULE-0001, RULE-0002
- `KNOWLEDGE_APPLIED`: NONE
- `NEW_KNOWLEDGE_CANDIDATE`: NO

WORK_ID: 0061
DISPATCH_ID: 0061-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
