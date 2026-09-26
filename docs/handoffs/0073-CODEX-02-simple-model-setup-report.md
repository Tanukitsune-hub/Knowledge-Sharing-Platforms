# Work 0073 CODEX-02 — APIキー・モデル設定の実装報告

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_3_HIGH

## Outcome

管理者ページのAI設定を、候補選択またはModel ID直接入力から1回の「確認して保存」へ統合した。初回の既定モデルなし、キー設定・更新、既存キーでのモデル変更、詳細欄の非既定設定違いを同じ確認・保存経路で扱う。確認は既存model policyとprovider request builderを用い、4種類の合成sourceのindex/readback/source-scoped query/citationと一時Storeのexact cleanupが成功してから採用する。資格情報を受けるRPCには既存installer ownerとactive session identityに基づくserver側認可を設け、通常モデル変更のroleless契約を維持した。

Meeting、Pitchbook、News、Internal Assessmentの資料を人が判別できる一覧から安定IDで個別同期できる。残件同期、部分失敗と全体完了の表示、provider別の古い派生状態の初期化を追加した。Newsの複数Counterparty membershipは1 sourceのまま扱う。旧AI設定UIの多段ボタンは除き、管理者の削除記録・テーマ画面は維持した。Work0073全体のACCEPTED判定とCompletion Latchは行っていない。

## Acceptance Evidence Matrix

証拠階層: production sourceの局所/fake-provider試験 → 変更画面の合成browser操作 → bundle/package決定的整合。いずれもApps Scriptやlive providerのruntime証拠ではない。

| ID | 判定 | 主な証拠 |
|---|---|---|
| A1 | PASS | 既定なし・候補からのキー/モデル保存を`ai-model-setup.test.cjs`で確認。停止を維持。 |
| A2 | PASS | 一覧失敗、候補外の合成Model ID手入力をunit/browserで保存。 |
| A3 | PASS | モデルのみの変更でキー入力、運用Store作成、資料syncを呼ばず、停止状態とStore IDを保持。 |
| A4 | PASS | 通常カードは現在モデル・状態・次の操作。内部IDと任意思考値は詳細欄。キー欄はキー操作時だけ表示。 |
| B1 | PASS | 候補は明示取得と10分のprovider/credential世代別cache。通常検索のlist呼出しは追加していない。取得時刻・部分一覧を表示。 |
| B2 | PASS | 一覧失敗・空でも手入力可。一覧結果だけで保存済みpolicyを書かない。 |
| B3 | PASS | candidate key一覧はCredential Operatorを毎回確認し共有cacheを使用しない。active cacheは世代で分離。 |
| C1 | PASS | 新規はprovider標準の任意思考パラメータ省略。既存明示値と出力上限を保持し、詳細変更は同じ保存経路。 |
| C2 | PASS | 選択tupleだけ既存request builderで4-source検索し、未確認tupleの通常実行拒否をpolicy回帰で確認。 |
| C3 | PASS | 同一実効tuple/表示名変更は再確認0。思考値・出力上限・credential世代の変更は対象tupleを再確認。 |
| C4 | PASS | 一時Storeで4-source index/readback/query/citationを確認しexact cleanup。運用Store IDを証拠に混同せず、初回Storeなしで保存可。 |
| D1 | PASS | active identity/owner/admin不一致と旧RPCのraw keyを拒否。認可時にinstaller stateを変更しない。 |
| D2 | PASS | 候補の確認失敗、既存Storeアクセス不一致、cleanup不確実なら旧key/model/enabled/Store/source stateを保持。 |
| D3 | PASS | 短いlockとpolicy/credential世代CAS、保存途中失敗の復元、operation readbackを検証。応答不明なら自動再送しない。 |
| D4 | PASS | 安全なerror/statusのみ返す。候補キーは操作中のローカル値で、成功/失敗/取消/画面離脱で入力欄を消去。停止中のみ認可済み削除。 |
| E1 | PASS | 4-source一覧→安定ID指定→sync。複数CounterpartyのNewsは一覧で1件。 |
| E2 | PASS | 4-sourceの旧Storeに紐付いた当該providerの状態だけresetし、原本と他providerのIndexed状態を保持。 |
| E3 | PASS | partial/remaining/batchCompleteを区別して表示。既存syncの変更なしsource再upload 0と個別失敗後の再試行契約を回帰で確認。 |
| F1 | PASS | production HTMLと両admin clientを読み込むローカルbrowserで1440×900/390×844、keyboard、focus復帰、busy/error/unknown、再送防止、同期結果、横scroll 0、console error 0を確認。 |
| F2 | PASS | 直接結合回帰、`npm run check` 749/749、foundation、`git diff --check`、bundleと7-file packageのbyte parity。 |

主な追加試験は`tests/ai-model-setup.test.cjs`、`tests/ai-model-setup-commit.test.cjs`、`tests/work0073-model-setup-browser.cjs`。ブラウザ試験はfake serverを使う`SYNTHETIC_BROWSER_RENDER`であり、アプリの実認可・実保存・実providerのPASSではない。

## Exact distribution

```text
TARGET_RELEASE: 0.2.4
TARGET_SCHEMA: 9
BACKEND_SHEETS: exactly 7
SOURCE_COMMIT: 844024f55ad19c4a084aadedb4f8b21aa001446c
BUNDLE_FILE_SHA256: e3164d1de9520fc60ad48e0f0deef8589ed94525fd7fe04b53d97c0a5ee5e604
BUNDLE_PAYLOAD_SHA256: 9e08fb72df104165eb424eb987e694d28f53c4c91d9df354ab443b39545935bd
COMPANY_PACKAGE_GS_FILES: 7
COMPANY_PACKAGE_MAX_FILE_BYTES: 437391
```

`scripts/build-company-multifile-package.cjs`の独立BASIS、`dist/release-manifest.json`、bundle、7-file packageを同じsource freezeへpinした。新sheet、migration、trigger、権限変更はない。

## Runtime and side effects

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: NOT_RUN
R1: NOT_RUN — 認可済みApps Script実行対象が今回の許可範囲外
R2: NOT_RUN — 専用の許可済み実キー/live provider実行が今回の許可範囲外
SIDE_EFFECT_STATE: DISABLED
REAL_PROVIDER_CALL_COUNT: 0
REAL_CREDENTIAL_READ_OR_WRITE_COUNT: 0
AI_INDEX_MUTATION_COUNT: 0
APPS_SCRIPT_SOURCE_SYNC: 0
DEPLOYMENT_UPDATE: 0
COMPANY_DATA_MUTATION_COUNT: 0
USER_NATIVE_ACTION_COUNT: 0
BLOCKER: NONE_IN_CODEX_02_CANDIDATE; CHATGPT_FINAL_REVIEW_PENDING
READY: FOR_CHATGPT_REVIEW_ONLY
```

R1/R2は後続の独立したruntime qualificationである。実providerのAPI契約・権限・永続化・cleanupの成立はこのreportで主張しない。会社展開、Work全体のACCEPTED、mergeは未実施。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, OBS-0018
KNOWLEDGE_APPLIED: OBS-0018
NEW_KNOWLEDGE_CANDIDATE: YES

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
