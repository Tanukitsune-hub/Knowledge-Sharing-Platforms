# Work 0054 dispatch control

WORK_ID: 0054
DISPATCH_ID: 0054-CODEX-01
ACTIVE_DISPATCH_ID: 0054-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
PHASE: ADMIN ROLE / OBSOLETE AUTH CLEANUP

## Primary Outcome

ユーザー確定方針「管理者roleを作らず、Web App利用者は管理者ページを含む同じ機能を利用できる」を正本化し、現行sourceに残る過去のshared-admin / adminEmails認証dead codeを安全に整理して、実装と方針を一致させる。

## Acceptance Evidence

- `docs/decisions/admin-page-access-model.md`を正本とする
- 管理者ページと3タブを維持
- app-level admin role / admin email allowlist / shared password gate: 0
- AI設定 / 削除記録 / テーマ設定の既存機能を維持
- Work0051 / Work0052 / Work0053 regression PASS
- focused tests PASS
- `npm run check` PASS
- `npm run check:bundle` PASS
- browser regression PASS
- target-runtime qualificationを必要十分な範囲で実施
- permission broadening / new deployment / unrelated provider call / real business-data mutation: 0
- BLOCKER: NONE

## Scope

- `src/165_AiProviderAdmin.gs`を中心とするobsolete shared-admin / administrator identity helpers
- 対応tests / fixtures / docs
- generated bundle / manifest
- 必要なruntime qualification

## Non-goals

- 管理者ページrename
- 新role model
- Workspace directory integration
- shared password導入
- Work0055
- Work0056

## Authorization boundary

既存owner-only Web Appのaccess boundaryを変更しない。provider call、実business-data mutation、permission変更、新deploymentは行わない。source sync / immutable version / existing deployment updateが必要な場合は、target identity確認後、各1回を上限とする。

## Closed Conclusions

- `管理者ページ` labelは維持
- admin account modelは作らない
- `adminEmails` allowlistは使わない
- Google identityでadmin判定しない
- shared password gateは現時点で導入しない
- Work0055 / Work0056は別Work

## Codex instruction

まず最新`main`と最寄りの`AGENTS.md`、本decision、Work0053 completionを読む。

1. 現在のproduction call graphを確認し、shared-admin / administrator identity codeのうち本当にunusedな部分だけを特定する。
2. dead code削除が既存provider/admin behaviorへ影響しないことをtestsで固定する。
3. 最小diffでobsolete auth mechanismを削除する。別の認証機構へ置き換えない。
4. 管理者ページ3タブ、AI設定、削除記録、テーマ設定を維持する。
5. focused tests → canonical check → bundle validation → browser regressionの順で検証する。
6. target runtime変更が必要なら既存owner-only target identityを先に確認し、同じdeploymentだけを更新する。
7. reportとdispatchを更新し、ChatGPTへRETURNする。ACCEPTED / Completion LatchはChatGPT final reviewまで適用しない。

## Recommended model

GPT-5.6 Sol High。理由: 過去の認証コードを削除する作業で、call graphとsecurity boundaryを誤判定しないことが重要なため。

## Report

`docs/handoffs/0054-CODEX-01-shared-admin-policy-cleanup-report.md`

```text
NEXT_UNUSED_DISPATCH: 0054-CODEX-02
WORK_0054_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0054
DISPATCH_ID: 0054-CODEX-01
BALL: CHATGPT
STATUS: RETURNED

## CODEX-01 return

- Draft PR #85に旧shared-admin dead codeと専用fixtureの削除、generated bundle、reportを追加した。
- focused 79/79、`npm run check` 673/673、`npm run check:bundle` 30/30、deterministic browser 20 checksはPASS。
- [report](0054-CODEX-01-shared-admin-policy-cleanup-report.md)に、通常Web App管理者ページのrole gate 0と、現役editor installer `adminEmails` guardの境界を記録した。`BLOCKER: INSTALLER_ADMINEMAILS_POLICY_SCOPE_CONFLICT`はChatGPT final reviewへ返す。
- live mutation 0。ACCEPTED判定とCompletion LatchはChatGPT final reviewへ残す。
