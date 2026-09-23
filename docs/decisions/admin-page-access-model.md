# Work 0054 — 管理者ページの利用権限方針

WORK_ID: 0054
STATUS: ACTIVE
MODE: BUILD

## Decision

利用者ごとの「管理者role」は導入しない。

現行のPrivate Assets Intelligenceでは、Web Appへアクセスできる利用者は同じアプリ機能を利用できる前提とし、`管理者ページ`も特定ユーザーだけに限定しない。

```text
ADMIN_ACCOUNT_MODEL: NONE
WEB_APP_ADMIN_EMAIL_ALLOWLIST: NONE
WEB_APP_GOOGLE_IDENTITY_ADMIN_GATE: NONE
WEB_APP_SHARED_PASSWORD_GATE: NONE_FOR_NOW
ADMIN_PAGE_LABEL: 管理者ページ
ADMIN_PAGE_VISIBILITY: ALL_AUTHORIZED_WEB_APP_USERS
INSTALLER_OPERATOR_AUTHORIZATION: PRESERVE
```

## Rationale

- `管理者ページ`は「特定の管理者だけが入るページ」という意味ではなく、AI設定・削除記録の管理・テーマ設定をまとめる操作ページとして名称を維持する。
- アプリ独自の管理者アカウント、role、`adminEmails` allowlist、Google Workspace identityによるrole判定は追加しない。
- 共通passwordによる追加gateも現時点では導入しない。将来、実利用上必要になった場合だけ別Workで検討する。
- Web App自体のGoogle Workspace / Apps Script側アクセス境界は維持する。この決定はWeb Appを公開化したり権限範囲を広げたりするものではない。
- editor-visible installer / deployment-security operatorは別のsecurity boundaryであり、既存のowner latch / session identity / installation configの`adminEmails`による認可を維持する。これは通常Web Appの管理者roleではない。

## Required implementation cleanup

既存コードに過去Work由来のunusedな管理者認証機構が残っているため、現行方針と矛盾するdead code / obsolete contractを限定的に整理する。

対象候補:
- shared administrator password / token helpers
- `adminEmails` / Session email based administrator helpers
- obsolete admin-only error contracts
- それら専用のtests / fixtures

維持:
- `管理者ページ`と3タブ
- AI設定のread/write
- 削除記録の検索・復元
- テーマ設定のread/write
- Apps Script / Workspace側の既存Web App access
- provider / business-data / backup / permissionの既存安全境界

## Acceptance Evidence

- 管理者ページが通常のauthorized Web App userに表示される
- AI設定のmutationがapp-level admin role / email allowlist / shared passwordを要求しない
- 削除記録管理とテーマ設定も同じ利用者モデルを維持
- 通常Web Appの管理者ページcall graphにactiveな`adminEmails` gateがない
- 通常Web Appの管理者ページcall graphにactiveなshared-admin password/session gateがない
- editor installerの既存operator authorizationを維持
- 管理者ページ3タブを維持
- Work0051 / Work0052 / Work0053 regression PASS
- `npm run check` PASS
- bundle validation PASS
- target runtimeで既存owner-only Web Appのaccess boundaryを変更しない
- provider call / business-data mutation / permission changeはqualificationに不要なら0
- BLOCKER: NONE

## Non-goals

- 管理者ページの名称変更
- 新しいユーザー管理DB
- Workspace group / directory連携
- Web App access scope変更
- shared password導入
- installer operator authorizationの再設計
- Work0055 color UI improvement
- Work0056 mobile overflow fix
