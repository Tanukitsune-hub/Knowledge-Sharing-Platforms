# Work 0054 CODEX-01 — 管理者ページ旧認証コードの整理

WORK_ID: 0054
DISPATCH_ID: 0054-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
PR: [Draft #85](https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/85)
BASE: `origin/main` `0b64802eb72788e3c9d8bc942093f4bad0430f9b`
SOURCE_COMMIT: `baaa35c3a53324b25649f79204b96bc0177ee068`

## Outcome

通常のWeb Appで使う`管理者ページ`は、AI設定の読み取り・変更、削除記録の検索・復元、テーマ設定を、アプリ独自の管理者roleなしで提供する。production call graphを確認したうえで、呼び出し元のないshared-admin password/tokenとSession emailによる管理者判定、その専用アダプター・エラー・test fixtureだけを削除した。別の認証機構は追加していない。

`管理者ページ`の名称、navigation、`AI設定`・`削除記録の管理`・`テーマ設定`の3タブは維持した。Web Appの公開範囲、Apps Script manifest、provider、Backend、Audit、backup、Theme保存値には変更を加えていない。

## Production call graphと削除範囲

- UIのAI設定は`ClientAiProviderSettings.html` → `getAiProviderAdminData` / `mutateAiProviderSettings` → `kspGetAiProviderAdminData_` / `kspMutateAiProviderSettings_`へ進む。どちらも旧shared-admin token、`adminEmails`、Session emailを参照しない。read responseの`canMutate: true`と既存のprovider設定処理は維持した。
- `kspManageSharedAdminSession_`はprivateで、production source内の呼び出し元と公開entrypointが0。配下のpassword verifier、token署名・検証、credential property adapter、Session email administrator helpersはこの未使用経路に閉じていた。
- 削除記録・Themeのnormal Web App entrypointsには、当該shared-admin helperへの依存がない。既存のread/write・検索/復元serviceは変更していない。
- `Session.getActiveUser()`のうちMeeting actor取得は管理者判定ではないため維持した。

変更したproduction source: `src/160_AiEnvironment.gs`、`src/165_AiProviderAdmin.gs`。後者のobsolete `SHARED_ADMIN_*` / `AI_PROVIDER_ADMIN_UNAUTHORIZED` error contractも削除した。`dist/KnowledgeShare.bundle.gs`、`dist/release-manifest.json`、`dist/INSTALL.md`は現行sourceから再生成した。

## 現役インストーラー認可との境界

`src/15_Installer.gs`の`adminEmails`は、editor-visibleなinstall/readiness/attestation operator wrapperで現在も使用される。`src/AGENTS.md`はこの入口の実行者認可を要求する。これは通常の`管理者ページ`のrole gateではなく、Web App利用者が呼ぶAI設定・削除記録・Themeの経路にも入らない。今回の「unusedな機構だけを削除」「別の認証機構へ置き換えない」という指示の下では、現役の導入保護を削除せず維持した。

従って、decisionの「production sourceにactiveな`adminEmails` gateがない」をrepository全体に文字どおり適用した場合、この項目だけは未達となる。通常のWeb App管理者ページのcall graphでは該当gateは0。ChatGPT final reviewでは、この境界を明示して判定する必要がある。

## Validation

| Gate | Result |
| --- | --- |
| focused tests | 79/79 PASS。AI設定、旧認証不使用、Work0051 backup、Work0052 cited-source、関連UI |
| `npm run check` | 673/673 PASS。public surface、Work0051/52/53を含む |
| bundle regeneration | PASS。63 server sources、23 HTML resourcesから再生成 |
| `npm run check:bundle` | 30/30 PASS。installer authorization/idempotencyとsource/bundle parityを含む |
| browser regression | `SYNTHETIC_RENDER_ONLY` PASS、20 checks。7画面は1440/390pxで非空。管理者ページ3タブ、AI controls、削除記録導線、Theme操作を確認。console material error/warn、page error、dialog、blocked requestは各0 |
| responsive | 1440pxで7画面overflow 0。390pxで他6画面overflow 0、Entity Workspace展開時176px（既知Work0056 baseline以内） |
| `git diff --check` | PASS |

Browserの要約は[0054-CODEX-01-browser-evidence.json](0054-CODEX-01-browser-evidence.json)に保存した。browser RPCはsynthetic fixtureであり、target Apps Script runtimeやproviderを実行した証拠ではない。

## Target runtimeとside effects

このdiffは到達不能な旧認証処理の削除であり、通常Web Appのserved behaviorは変更しない。Work0053 completion reportでowner-only version35の実runtimeは確認済みだが、本PR sourceのtarget-runtime qualificationは実施していない。PR review前のsource sync / version36作成 / deployment updateは不要と判断した。

```text
TARGET_RUNTIME_QUALIFICATION: NOT_RUN_FOR_THIS_PR
CURRENT_ACCEPTED_RUNTIME_BASELINE: VERSION35_FROM_WORK0053
APPS_SCRIPT_SOURCE_SYNC: 0
IMMUTABLE_VERSION_CREATE: 0
EXISTING_DEPLOYMENT_UPDATE: 0
NEW_DEPLOYMENT: 0
PROVIDER_CALLS: 0
REAL_BUSINESS_DATA_MUTATION: 0
BACKUP_RESOURCE_MUTATION: 0
PERMISSION_CHANGE: 0
WEB_APP_ACCESS_CHANGE: 0
WORK0055_OR_WORK0056_CHANGE: 0
WORK0030: DEFERRED_BY_USER
```

BLOCKER: INSTALLER_ADMINEMAILS_POLICY_SCOPE_CONFLICT。通常Web App管理者ページのgateは0だが、decisionのrepository-wide文言と現役installer guardは両立していない。現役認可の削除は「unusedのみ」「別機構への置換なし」の範囲を超えるため、ChatGPT final reviewで境界を判定する。
READY_FOR_CHATGPT_FINAL_REVIEW: YES
WORK_0054_ACCEPTED: NO
COMPLETION_LATCH: NOT_APPLIED

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: NONE（canonical indexと対象語を確認し、一致するentryなし）
KNOWLEDGE_APPLIED: NONE
NEW_KNOWLEDGE_CANDIDATE: NO
