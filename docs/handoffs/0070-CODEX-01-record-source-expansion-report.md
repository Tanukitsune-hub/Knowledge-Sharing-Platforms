# Work 0070 CODEX-01 — record source expansion 実装報告

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_3_HIGH

## 結果

Work0069のClosed Decisionsに沿って、`面談メモ / 保存資料 / ニュース / 評価（ICメモ、社内整理等）` の4-source record layerをrepository sourceへ実装した。Draft PR: [#103](https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/103)。ChatGPT review用のsourceとdeterministic evidenceを返す。Work0070全体の`READY: NO`。target-runtime qualificationは別Dispatchで行う。

## 実装範囲

- schema9へ移行し、Backendを`Counterparty_Master / Option_Master / Meeting_Index / Pitchbook_Index / News_Index / Internal_Assessment_Index / Settings`の7 sheetにした。既存IDと行を維持し、2回目setupの冪等性、既存folder IDによるexact legacy nameのみのrename、custom nameの維持を実装した。
- `Alternative Assets Intelligence`を現在の表示titleへ適用し、authoritative Drive root/4 childrenの名称をWork0069の決定に合わせた。
- Add/Pastの4-tab UI、shared fieldsとtab別の未保存state、global clearのfail-closed、24時間の通常入力silent restore廃止を実装した。standalone保存資料は既存Pitchbook経路を再利用し、Meetingに紐づく資料も維持した。
- News/AssessmentのDIRECT_TEXTとUPLOAD_FILE、複数Counterparty、検索・詳細・編集・Inactive/Reactivate・管理者復元を実装した。短いlock、stable ID、same-record stale-write拒否、commit時のmaster検証、request retryのsource identity照合を維持した。
- 6形式の共通upload registryをserver/browserへ通し、`src/`からrelease `0.2.0`のsingle-file bundleと7-file company packageを生成した。provider検索/Full Output/DigestはこのDispatchの対象外。

## Evidence hierarchy / boundary

このDispatchの直接証拠はrepository sourceとfocused deterministic tests、generated artifactの再構成、synthetic browserである。Apps Script、Workspace、Web Appでの挙動は未観測であり、これらの結果をtarget-runtime PASSへ外挿しない。isolated test doublesとlocal browser harnessのみを使用した。deployment、Drive/Sheets実環境、company data、provider、credential、billingへの操作は行っていない。

## Acceptance Evidence

| 項目 | 結果・根拠 |
|---|---|
| LOGIC_VALIDATION | PASS — focused suites、714件のcanonical check、synthetic browser、bundle/package検証 |
| SCHEMA8_TO_9_MIGRATION | PASS — in-place migration、既存ID/row/resource維持のfocused tests |
| SECOND_RUN_IDEMPOTENCY | PASS — 2回目setupのfocused tests |
| BACKEND_SHEET_COUNT_TARGET | PASS — schema9でexactly 7 sheetsのfocused tests |
| LEGACY_FOLDER_RENAME_RULES | PASS — stored IDに対するexact legacy namesのみrenameするfocused tests |
| CUSTOM_FOLDER_NAME_PRESERVATION | PASS — custom名を維持するfocused tests |
| MEETING_REGRESSION | PASS — create/edit/Past/関連資料/recoveryの既存・focused tests |
| PITCHBOOK_STANDALONE | PASS — parentなしの同一Pitchbook経路をfocused testsで確認 |
| PITCHBOOK_PARENT_BOUND_REGRESSION | PASS — parent付き資料、relation、既存Pitchbook tests |
| NEWS_DIRECT | PASS — Google Doc経路の登録・readback・body editのservice tests |
| NEWS_UPLOAD | PASS — original file経路、byte/MIME照合、retryのservice tests |
| NEWS_LIFECYCLE | PASS — search/detail/edit/Inactive/Reactivate/admin restore tests |
| ASSESSMENT_DIRECT | PASS — DIRECT_TEXTの登録・readback・edit tests |
| ASSESSMENT_UPLOAD | PASS — UPLOAD_FILEの登録・readback・edit tests |
| ASSESSMENT_LIFECYCLE | PASS — search/detail/edit/Inactive/Reactivate/admin restore tests |
| MULTI_ENTITY | PASS — canonical sorted/unique `Counterparty_IDs`、commit時のactive master検証 tests |
| DRAFT_RESTORE_REMOVED | PASS — 通常入力のsilent restore廃止とretry safetyをclient testsで確認 |
| SHARED_TAB_STATE | PASS — 4-tabのshared/tab別stateとsuccess後の保持をclient/browser testsで確認 |
| GLOBAL_CLEAR | PASS — 4-tabの入力/file clear、未解決retry時のfail-closed tests |
| UPLOADER_FORMAT_PARITY | PASS — `.pdf/.pptx/.xlsx/.docx/.txt/.eml`の共通registryとbrowser accept/検証 tests |
| CONCURRENCY_DISTINCT_CREATE | PASS — interleaved News/Assessment createsでunique IDs、両row保持 |
| CONCURRENCY_STALE_EDIT | PASS — same-record claim/CASでstale write拒否 |
| BROWSER_1440 | PASS — synthetic Add/Past 4-tab、News/Assessment、standalone Pitchbook、console/page error 0 |
| BROWSER_390 | PASS — 同じ変更面、長いAssessment label、console/page error 0 |
| HORIZONTAL_OVERFLOW | PASS — 1440px/390pxでmaterial overflow 0 |
| BUNDLE_VALIDATION | PASS — 67 server sources / 24 HTML resources、bundle validator |
| MULTIFILE_PACKAGE_PARITY | PASS — 7 `.gs` raw concatenate = canonical bundle、SHA-256一致、package `--check` |
| CANONICAL_CHECK | PASS — 最終`npm run check` 714/714 |
| DIFF_CHECK | PASS — `git diff --check`とstaged diff check |
| TARGET_RUNTIME_QUALIFICATION | NOT RUN (planned CODEX-02) |
| DEPLOYMENT_MUTATION_COUNT | 0 |
| PROVIDER_CALL_COUNT | 0 |
| COMPANY_DATA_MUTATION_COUNT | 0 |
| BLOCKER | NONE for CODEX-01 source delivery。Work全体のruntime qualificationは未完了 |

Focused schema/setup、installer/backup、maintenance、server/client、bundle/package suitesに加え、`node tests/work0070-source-client-browser.cjs`で1440px・390pxを確認した。ブラウザーharnessでcross-tab input bleed 0、material console warning 0、外部request 0。`node scripts/validate-apps-script.cjs`、`validate-public-surface.cjs`、`validate-temporal-contract.cjs`、`validate-apps-script-bundle.cjs`、package `--check`もPASS。

## Source / generated identity

- Branch: `work/0070-source-record-layer`
- Base確認: `origin/main` `ebfd13b3b2b7b806a0da17956d95b6c7b3ff3c62`
- Generated artifactのsource commit: `d7cb7e3324f7363ecc35d147ebdd39c5f038172b`
- Release: `0.2.0` / schema9
- Bundle file SHA-256: `cc05693d92e9d66951cf06c3c56ee88b63329d3e768a228ed58da022a04b3144`
- Bundle payload SHA-256: `3fb9fe96474dd1531a4bd5f0bee1804e12fcc40e3569b3ca65e1d880ee2a4ace`
- `dist/company-multifile/`の7 `.gs`連結は1,405,755 bytesのbundleと一致。

## 検証中の修正と残余

初回canonical checkはroot `AGENTS.md`のfoundation size gateで停止したため、要件を保って文言を圧縮した。次のrunでは旧管理者画面の固定header/RPC名を期待するテスト6件が失敗し、4-sourceの新契約とfixtureに合わせて更新した。該当focused tests 19/19、最終canonical check 714/714がPASS。生成物のHTML resource partは411,202 bytesで、builderのresource hard limit 450,000 bytes内。server partは各400,000 bytes以内。package testもこの区別に合わせた。これらは同じ失敗classの反復ではなく、各gateで見つかった期待値・サイズ前提を修正したもの。

FOLLOW_UP: ChatGPTがDraft PRのsourceとevidenceをreviewし、必要なら`0070-CODEX-02`で隔離されたtarget-runtime schema9 migration、Workspace persistence、browser、team concurrencyをqualificationする。今回のsource evidenceだけでWork0070をACCEPTEDにしない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: OBS-0014
KNOWLEDGE_APPLIED: OBS-0014
NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
