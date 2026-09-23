# Work 0054 — Roleless Admin Page requirements

WORK_ID: 0054
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0053 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

Private Assets Intelligenceでは、application-levelの「管理者アカウント / 一般利用者アカウント」という区分を設けない。

一方で、現在の `管理者ページ` は機能グループとしてそのまま残す。

つまり:
- `管理者ページ` という名称・場所は維持
- Web App利用者ごとの管理者ロールは作らない
- 特定メールアドレスを管理者として登録・運用しない
- Web Appにアクセスできる利用者は、原則として管理者ページ内の機能も利用できる

## User decision

```text
VISIBLE_ADMIN_PAGE: KEEP
ADMIN_PAGE_LABEL: 管理者ページ
IN_APP_ADMIN_ACCOUNT_ROLE: NONE
ADMIN_EMAIL_ROSTER_AS_APP_AUTHORIZATION: NO
HARD_CODED_PERSON_AUTHORIZATION: NO
EQUAL_FUNCTIONAL_PERMISSION_FOR_WEB_APP_USERS: YES
```

「管理者ページ」は権限ロール名ではなく、AI設定・削除記録・テーマ設定など通常利用では触らない機能をまとめる便宜上の名称とする。

## UI

Keep:
- `管理者ページ`
- 管理者ページ内のtab構成
- AI設定
- 削除記録の管理
- テーマ設定

Do not:
- `管理者ページ` を `設定` にrenameしない
- 管理者ページ自体をnavigationから削除しない
- account roleによって表示/非表示を切り替えない

UI文言の自然化はWork0053のaccepted方針に従うが、`管理者ページ` という名称自体は維持する。

## Authorization model

Application feature permission:
- Web Appにアクセスできる利用者は原則同一
- `adminEmails` による機能gateは使わない
- hard-coded email/personによるgateは使わない
- installer ownerを通常のアプリ機能authorizationには使わない
- personnel roster UIは作らない

Google-side access remains separate:
- Web App deployment access
- Drive permissions
- Apps Script project/editor permissions
- deployment owner / execute-as

これらGoogle側のアクセス境界はこのWorkで変更しない。

## Backend backup / operator

Work0051のbackup運用についても、他利用者が通常触りに行くsurfaceではないため、application-levelのadministrator roleを追加しない。

`runBackendDailyBackupNow()` は引き続きApps Script editor運用用とし、通常Web App UIへbackup操作を追加しない。

## Optional future password gate

将来的に、`管理者ページ` を開く際だけ共通パスワードを要求する可能性がある。

ただしこれは:
- 特定accountを管理者にする仕組みではない
- role-based access controlではない
- 「管理者ページの中を見るための共通knowledge gate」に近い
- Web App利用者自体の機能権限を人ごとに管理するものではない

このpassword gateはWork0054では実装しない。

```text
ADMIN_PAGE_SHARED_PASSWORD_GATE: DEFERRED_OPTION
IMPLEMENT_NOW: NO
DECISION_TIMING: NEAR_FINAL_ROLLOUT
```

必要になった場合だけ、最終工程付近で別Workとして実装判断する。

## Existing legacy admin mechanisms

Existing code may contain:
- `adminEmails`
- shared-admin password/session helpers
- installer-owner concepts
- `isAdministrator` naming

Work0054ではまず用途を分類する。

Remove/disable only if:
- ordinary Web App feature accessをaccount-levelで制限するためだけに使われている

Preserve if:
- installer/deployment recovery safety
- infrastructure ownership
- credential protection unrelated to user roles
- historical metadata where removal adds unnecessary migration risk

YAGNI:
role廃止のために無関係なinstaller architectureを大改修しない。

## Acceptance Evidence

- visible `管理者ページ` remains
- current 管理者ページ navigation remains
- AI設定 / 削除記録 / テーマ設定 remain reachable
- no account-level admin role is required for ordinary Web App use
- no `adminEmails` gate blocks ordinary 管理者ページ functions
- no hard-coded user/email authorization
- Work0051 manual backup operator remains intact
- deployment access unchanged
- Drive permissions unchanged
- provider secrets remain server-side
- browser regression PASS
- business/backend semantics unchanged
- Work0030 remains DEFERRED_BY_USER
