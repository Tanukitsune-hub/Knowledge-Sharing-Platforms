# Implementation-first / Final Live Qualification Decision

Work ID: 0003

Date: 2026-08-16

Status: Accepted

## Decision

Knowledge Sharing Platformsは、機能実装を先に連続して進め、Apps Script / Google Workspace / Gemini APIを使う実機qualificationは原則としてfeature-complete後の最終工程へ集約する。

開発途中では、実機環境へ都度deployして確認することを標準フローにしない。代わりに、pure logic、schema、ID、filename、filter、retry、audit payload、EML normalization、Gemini request/response mapping等をlocal / static / mock / contract testで検証しながら実装を継続する。

## Rationale

- 本プロジェクトは既決仕様が多く、実機確認のたびに実装を止めるより、feature-completeまで一気に進める方が開発効率が高い。
- Apps Script / Workspace / GeminiのOAuth、deployment、権限、実データ環境準備を開発途中で何度も行う運用を避けられる。
- 主要なdomain logicはApps Script service依存から分離し、local validation可能な構造を採るため、実機確認を後ろ倒ししても実装品質を維持できる。
- 最終qualification時に、実環境固有の問題だけをまとめて切り分けて修正できる。

## Development validation

実装中に行う:

- syntax / static validation
- pure unit tests
- schema / migration tests
- ID / sequence tests
- filename normalization tests
- validation / filter tests
- partial-failure / retry idempotency tests
- audit payload / redaction tests
- Actor fallback tests
- EML parsing / normalization tests
- Gemini File Search clientのrequest / response contract tests using mocks / fixtures
- UI logic tests where practical
- representative regression tests

実装中に原則行わない:

- Apps Script DEV deploymentを使う逐次smoke test
- Shared Drive / Sheets / Docsへのlive write verification
- Gemini File Search live indexing / query
- 15-minute triggerのlive waiting test
- OAuth / permission qualification
- live multi-user concurrency test

## Final live qualification

全機能のlocal/static validationがPASSし、feature freezeした後に、DEV実機でまとめて1回のqualification cycleを開始する。

確認対象:

1. `setupKnowledgePlatform()`によるresource creation / reuse / repair
2. Web App deployment / navigation
3. Meeting end-to-end
4. Pitchbook end-to-end and practical upload limit
5. Past Records / Master / concurrency
6. restricted Audit Spreadsheet and Actor fallback
7. Gemini File Search Store / indexing / metadata / retrieval
8. six source formats and EML normalization
9. 15-minute sync worker / retry / re-index / Inactive / Reactivate
10. five Knowledge Search modes
11. citations / Drive links
12. AI outage isolation
13. credential / access / retention requirements

実機qualificationでimplementation defectが見つかった場合は、その最終Work内で修正し、affected caseと代表regressionだけを再実行する。重大な共通基盤変更が入った場合のみfull qualificationを再実行する。

## Exception

実装継続が安全に不可能になるほど重大なAPI仕様不明点があり、公式仕様・mock・contract testだけでは解消できない場合に限り、最小限のlive probeを前倒しできる。

前倒しprobeは設計再検討のための通常工程ではなく、明確なBLOCKER解消に必要な最小範囲に限定する。

## Non-goals

- 各Workごとのlive deployment
- 小変更ごとのApps Script実機確認
- Gemini live queryを開発中の通常test loopにすること
- 実機検証不足を理由に既決仕様を再オープンすること

Work ID: 0003
