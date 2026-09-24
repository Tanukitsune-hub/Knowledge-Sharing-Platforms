# Work 0061 — result freshness and request coherence

WORK_ID: 0061
STATUS: ACTIVE
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Primary Outcome

利用者が現在選択・入力している質問、検索条件、面談先と、画面に表示されるAI回答／Entity Workspace内容の対応関係を明確にし、古いrequestの結果をcurrent resultとして見せない。

## Scope A — Knowledge Search

- query fingerprintへ`questionOrInstruction`を含める。
- 検索開始時のpayload identityを保持し、同期response / pending poll / resumeのいずれもcurrent requestと照合する。
- question、mode、filter、entity selection、model / thinking等のquery-defining input変更時、既存回答をcurrent resultとして残さない。
- 既存の「条件変更でresultをhiddenにする」patternを優先して統一する。新しい複雑なstale UIは必要な場合だけ。
- pending queryを無効化した後に遅れて返ったresponseがresult / statusを上書きしない。
- sessionStorageからpending queryをresumeする場合、保存されたfingerprintと現在のpayload identityが一致しないならcurrent queryとしてresumeしない。
- current resultのscope表示は既存情報を維持し、不要な長文化をしない。

## Scope B — Entity Workspace

- Entity A表示後にEntity Bを選択した時、B loading中またはB load failure時にAの内容をBのcurrent contentとして見せない。
- 既存`entityWorkspaceRequestSequence`のout-of-order protectionを維持・補強する。
- B選択後に遅れて返ったA responseはBを上書きしない。
- loading / error時に現在対象が分かるstatusを保つ。
- Fund / Strategy drill-downの既存semanticsを壊さない。

## Safety / Boundaries

- provider server logic、prompt、retrieval、billing、schema、API contractを変更しない。
- provider callをvalidationのために実行しない。
- response correctnessではなくclient-side result identity / presentation consistencyだけを扱う。
- navigation IA、Entity Workspace情報設計、AI検索mode定義は変更しない。

## Acceptance Evidence

### Knowledge Search
- Question Aの回答表示後にQuestion Bへ編集すると、A回答はcurrent resultとして表示されない。
- A request開始後にinputを変更し、A responseが遅れて到着しても描画されない。
- A pending poll中に条件変更した場合、そのpoll responseはcurrent result / success statusを復活させない。
- pending query resumeはcurrent payload identityと一致する場合のみ継続する。
- query fingerprintは質問本文を含む。
- unchanged current queryは従来どおりresult表示可能。

### Entity Workspace
- A表示後にB選択すると、B loading中にA contentをBとして見せない。
- B load failureでもA contentをBのcurrent resultとして見せない。
- A→Bのout-of-order responseでAがBを上書きしない。
- Fund / Strategy drill-downは維持。

### Validation
- focused async/race/state tests PASS。
- relevant browser: Knowledge Search + Entity Workspace desktop / 390px。
- `npm run check` 1回。
- generated bundle更新時のみbundle validation。
- provider call / deployment / business-data mutation 0。
- unrelated pages・過去Work全件へ具体的Decision-Impact理由なしに拡張しない。

## Completion boundary

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。
