# Implementation-first / Final Live Qualification Decision

Work ID: 0003

Date: 2026-08-16

Status: Superseded on 2026-08-26

Superseded by: `docs/decisions/target-runtime-first-development.md`

This file is retained as historical evidence of the development policy applied to Works 0004–0014. It is not the default for new Work. Do not delete or rewrite historical qualification reports merely because the policy changed.

## Historical decision

Knowledge Sharing Platformsは、機能実装を先に連続して進め、Apps Script / Google Workspace / Gemini APIを使う実機qualificationは原則としてfeature-complete後の最終工程へ集約する。

開発途中では、実機環境へ都度deployして確認することを標準フローにしない。代わりに、pure logic、schema、ID、filename、filter、retry、audit payload、EML normalization、Gemini request/response mapping等をlocal / static / mock / contract testで検証しながら実装を継続する。

## Historical rationale

- 本プロジェクトは既決仕様が多く、実機確認のたびに実装を止めるより、feature-completeまで一気に進める方が開発効率が高いと当時判断した。
- Apps Script / Workspace / GeminiのOAuth、deployment、権限、実データ環境準備を開発途中で何度も行う運用を避ける意図があった。
- 主要なdomain logicをApps Script service依存から分離し、local validation可能な構造を採ることで、実機確認を後ろ倒ししても実装品質を維持できると想定した。
- 最終qualification時に実環境固有の問題だけをまとめて切り分ける方針だった。

## Historical development validation

実装中に行うとしていた項目:

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

実装中に原則行わないとしていた項目:

- Apps Script DEV deploymentを使う逐次smoke test
- Shared Drive / Sheets / Docsへのlive write verification
- Gemini File Search live indexing / query
- 15-minute triggerのlive waiting test
- OAuth / permission qualification
- live multi-user concurrency test

## Historical final live qualification

全機能のlocal/static validationがPASSし、feature freezeした後に、DEV実機でまとめて1回のqualification cycleを開始する方針だった。

確認対象:

1. `setupKnowledgePlatform_()`によるresource creation / reuse / repair
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

実機qualificationでimplementation defectが見つかった場合は、その最終Work内で修正し、affected caseと代表regressionだけを再実行する。重大な共通基盤変更が入った場合のみfull qualificationを再実行する方針だった。

## Historical exception

実装継続が安全に不可能になるほど重大なAPI仕様不明点があり、公式仕様・mock・contract testだけでは解消できない場合に限り、最小限のlive probeを前倒しできるとしていた。

## Why superseded

Work 0014では、deterministic test loaderがproduction名のbusiness helperを注入していた一方、production Apps Script sourceには当該helperが存在せず、実機maintenance flowで初めて失敗した。test data shapeとSheets native `Date` objectの差異も同時に表面化した。

この経験により、feature-complete後までtarget-runtime evidenceを後ろ倒しするより、最短vertical sliceをactual target runtimeで早期に実行する方が、個人・少人数開発では総手戻りとfalse readinessを減らせると判断した。

今後は`docs/decisions/target-runtime-first-development.md`を適用する。

Work ID: 0003
