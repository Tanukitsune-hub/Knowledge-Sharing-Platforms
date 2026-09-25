# Work 0070 CODEX-02 — source review repair 報告

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_3_HIGH

## 結果

Draft PR [#103](https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/103)のChatGPT source reviewで指摘された5件を、Work0069/Work0070のClosed Decisionsを維持して限定修正した。同一branch `work/0070-source-record-layer`を継続し、新しいPRは作成していない。`LOGIC_VALIDATION: PASS`、Work全体の`READY: NO`。ChatGPT reviewおよびCODEX-03のtarget-runtime qualificationは未完了であり、ACCEPTED / Completion Latchは適用していない。

## 修正内容

1. `kspGetSourceUploadFormats_()`が返すdotなしのcanonical extensionから、clientでdot付きbrowser `accept` tokenを生成する。Meeting attachmentとstandalone資料の共有file input、News、Assessmentで同じ6形式を表示し、helpも読みやすい形式名から生成する。browser fixtureはserver関数の実出力をVMで読み込む。
2. standalone資料のAsset ClassをUIのrequired項目にし、client submit時に未選択ならfocusと具体的errorを示してprepare RPC前に停止する。parent-bound Pitchbook経路には変更を加えていない。
3. News/AssessmentのTitle、News PublisherをAddとPast editで255文字に制限し、Fund / Strategyの500文字制限もPast editに明示した。serverの既存上限は変更していない。
4. 明示的な`SOURCE_REQUEST_EXPIRED`で割当前の操作が拒否された場合は保存中operationを解除し、次回は新request IDを使う。serverが返したstable retry ID/fingerprintがある場合は保持してrequest IDのみ回転させる。先行する通信失敗の保存結果が本当に不明でstable IDもない場合は、期限切れresponseだけでは過去の保存有無を確定できないためfail-closedを維持する。
5. Work0070の通常操作へ到達する`SOURCE_* / NEWS_* / ASSESSMENT_*`のactionable errorに、内部ID・path・raw errorを含まない公開メッセージを追加した。`SOURCE_FILE_CONFLICT`とcommit時のmaster再検証errorも含む。未登録の内部codeは従来のgeneric messageへfallbackする。

## Evidence hierarchy / side effects

production sourceから読み込むVM tests、clientとserver contractを接続するsynthetic browser、generated artifactのhash/byte照合をこのDispatchのlogic evidenceとした。browser fixtureのretry successはserver acceptanceを証明しないため、stable ID/fingerprintのclient保持はbrowser、server側の照合・idempotencyは既存service testsで別々に確認した。Apps Script/Workspace target runtimeは観測していない。local test doublesとlocalhost browser以外の外部呼び出しはない。

| Acceptance item | 結果・根拠 |
|---|---|
| UPLOAD_FORMAT_BOOTSTRAP_ACCEPT | PASS — real `kspGetSourceUploadFormats_()`の`pdf,pptx,xlsx,docx,txt,eml`から`.pdf,.pptx,.xlsx,.docx,.txt,.eml`を生成 |
| UPLOAD_FORMAT_REAL_SHAPE_FIXTURE | PASS — browser fixtureがproduction server関数をVM実行して利用 |
| STANDALONE_ASSET_CLASS_REQUIRED | PASS — required label/control、未選択時focus・error、`preparePitchbookBatch` 0 |
| STANDALONE_VALID_PATH | PASS —`AC-1`選択後、既存Pitchbook prepare/uploadが各1回、payloadにも`AC-1` |
| PITCHBOOK_PARENT_BOUND_REGRESSION | PASS — `tests/pitchbook.test.cjs`を含むfocused suite 42/42、Meeting relation経路を維持 |
| SOURCE_TEXT_LIMITS | PASS — Add/Past editのmaxLength 255、browserで256文字目を防止、server create/editで255受入・256拒否 |
| SOURCE_REQUEST_EXPIRED_RECOVERY | PASS — 割当前の明示的expiryはsession operationを解除し、次回に新request IDを使用。stable retry IDがある場合は保持してIDを回転 |
| SOURCE_UNKNOWN_OUTCOME_FAIL_CLOSED | PASS — transport failureは同じrequest IDを保持しglobal clearをblock。過去の結果不明のままexpiryになった場合もblock |
| SOURCE_RETRY_IDEMPOTENCY | PASS — clientでserver提供のstable ID/fingerprintを保持。server側の予約・replay・変更payload拒否testsは継続PASS |
| SOURCE_SAFE_ERROR_MESSAGES | PASS — actionable source validation/reference/retry/file codesの公開文言とunknown code fallbackをfocused testで確認 |
| BROWSER_1440 | PASS — changed Add/Past、4 upload surfaces、standalone、recovery。page error/warning/external request 0 |
| BROWSER_390 | PASS — 同じ変更面。material horizontal overflow 0、page error/warning/external request 0 |
| BUNDLE_VALIDATION | PASS — 67 server sources / 24 HTML resources、再生成・syntax・hash・inventory確認 |
| MULTIFILE_PACKAGE_PARITY | PASS — 7 `.gs`のraw concatenateとbundleが1,410,098 bytes / SHA-256一致、package `--check` PASS |
| CANONICAL_CHECK | PASS — 最終`npm run check` 716/716 |
| DIFF_CHECK | PASS — `git diff --check` / staged diff check |
| TARGET_RUNTIME_QUALIFICATION | NOT RUN (planned CODEX-03) |
| DEPLOYMENT_MUTATION_COUNT | 0 |
| PROVIDER_CALL_COUNT | 0 |
| COMPANY_DATA_MUTATION_COUNT | 0 |
| BLOCKER | NONE for CODEX-02 source review return。Work全体のruntime qualificationは未完了 |

## 検証経緯と境界

- focused server/Pitchbook testsは42/42、追加のcopy/source testsは18/18。synthetic browserは1440px/390pxともPASS。browser fixtureは実server upload-format出力を使い、外部request 0。
- 初回browser runは、shared Asset Classに残っていた選択値で「未選択」試験が成立していないことを検出し、試験で明示的に未選択へ戻した。後続runではrequest ID回転後のclient fingerprint不一致を検出して修正した。
- 初回canonical runは、旧copy testが公開文言と内部error code識別子を一緒に走査して停止した。表示メッセージ値だけを検査するように直し、独立reviewで見つかった`SOURCE_FILE_CONFLICT`公開文言も追加した。最終のfull checkは716/716 PASS。
- 明示的expiryの現在requestはcounter/source mutation前に拒否される。ただし過去のtransport failureが未解決でstable IDもない場合、その過去の結果はexpiry responseから判定できない。このケースをfail-closedとし、重複登録を許す自動回復を行わない。CODEX-03でもruntimeでこの境界を保持する。

## Generated artifact identity

- Release: `0.2.0` / schema9
- Source commit: `25c6e62d601e6c2e7a4f3f8faf4629e8a2627904`
- Bundle file SHA-256: `3e31e792b1292af8b21d730e7ab2e07efcb7be74ee2f03de78daaa6f99635f88`
- Bundle payload SHA-256: `1c89c32a5ff641951f90cdb9f22609d608dd5e3e924ea245c9d77984a5a52c89`
- 7-file package連結SHA-256: `3e31e792b1292af8b21d730e7ab2e07efcb7be74ee2f03de78daaa6f99635f88`

## 次の判断

ChatGPTが同じDraft PR #103の限定修正をreviewする。受入れ後、別Dispatch `0070-CODEX-03`で隔離されたtarget-runtime migration/persistence/browser/concurrencyをqualificationする。今回のdeterministic PASSをApps Script/Workspace readinessと扱わない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: OBS-0014
KNOWLEDGE_APPLIED: NONE
NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
