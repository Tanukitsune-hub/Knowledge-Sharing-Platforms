# Work 0028 — CODEX-02 shared administrator password bootstrap instruction

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## Source of truth

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0028-shared-admin-password`
Base main: `b0efbbfd8a5ce5c2e3b3d64f5ccba56838306ef2`

Read and obey the nearest applicable `AGENTS.md`, especially root, `src/AGENTS.md`, `tests/AGENTS.md`, and `docs/handoffs/AGENTS.md`, plus:

- `docs/decisions/shared-admin-password-mode.md`
- `docs/planning/work0028-shared-admin-password.md`
- `docs/handoffs/0028-dispatches.md`
- `docs/handoffs/0028-instruction.md`
- `docs/handoffs/0028-report.md`
- `docs/operations/apps-script-web-app-deployment.md`
- Work 0027 accepted handoff/report/runtime locator as preserved baseline evidence.

`0028-CODEX-01` is SUPERSEDED before execution. Do not execute its user-assisted password-entry contract.

## Primary outcome

Implement the shared-password administrator mode for the existing AI Provider Settings page so routine administration survives personnel changes.

Any user already authorized to use the Knowledge Share Web App may read the existing safe/redacted management page. After bootstrap, every AI Provider Settings mutation requires a valid shared administrator session and must not depend on Google account/email.

There is no time-based automatic administrator-session expiry.

## Current personal-DEV bootstrap decision

For this personal-DEV qualification only, ChatGPT supplies Codex an intentionally temporary, disclosed bootstrap password in the dispatch prompt.

- Codex may type that supplied value directly into the normal Web App UI during bootstrap/unlock qualification.
- Do not ask the USER to enter it solely for this campaign.
- Do not hard-code it as a product default or fallback.
- Do not persist plaintext in source, GitHub, Sheets, Script Properties, browser storage, logs, Audit, screenshots, fixtures or reports.
- Product code must work with arbitrary future passwords entered through the UI.
- The management UI must include password change. A successful password change rotates credential generation, invalidates prior tokens, and leaves the current browser with a coherent post-change state (fresh token or immediate re-unlock; choose one and test it).

The temporary bootstrap value will be changed by the user after introduction. It is not a production security credential.

## Required authentication contract

Implement a small reusable shared-admin authentication primitive:

1. **Persistence** — store only random salt, password verifier, random token-signing secret, and credential generation/version in Script Properties. Never persist plaintext. Use Apps-Script-native digest/HMAC and constant-time comparison.
2. **Bootstrap** — while no shared credential exists, only the existing legacy account administrator may initialize it. After initialization, legacy account/email identity alone no longer authorizes AI Provider Settings mutations.
3. **Unlock/session** — correct password returns an opaque signed token containing no account identity and no expiry timestamp. Bind it to credential generation plus random nonce. Store only the opaque token in browser `sessionStorage`; no TTL/timer and no unbounded server-side session list.
4. **Mutation authorization** — every existing AI Provider Settings mutation validates the token server-side. Missing/malformed/tampered/old-generation token fails closed. Client-side disabled controls are not the security boundary.
5. **Password change** — requires a valid shared admin session. New password is entered/confirmed in UI, never persisted client-side, generation increments, old tokens fail, and the new credential works immediately.
6. **Read-only management** — safe provider/model status stays readable while locked. Do not expose credentials, provider IDs, verifier material, tokens, account allowlists or private URLs.
7. **Explicit logout** — clears the browser token and returns the UI to locked state.

Preserve installer/setup/deployment/readiness owner/account authorization unchanged.

## UI scope

Keep the current page. Add only:

- locked/unlocked administrator-mode status;
- initial password setup when shared credential is absent;
- password unlock;
- `管理者モードを終了`;
- password change while unlocked.

When locked, existing mutation controls remain disabled. When unlocked, they become available only after server validation.

## Required tests

At minimum cover:

- legacy admin can bootstrap before initialization; non-admin cannot;
- plaintext password absent from persisted state/server responses;
- wrong password rejected; correct password returns valid token;
- same valid token authorizes under different fake active/effective Google emails;
- allowlisted legacy account without token is rejected after initialization;
- missing/tampered/malformed/old-generation token rejected;
- token contains no email/account identity and no expiry field; clock/time does not affect validity;
- representative existing AI-provider mutation guard accepts valid token in fake environment without performing live provider calls;
- password change invalidates old tokens and new password/session works;
- explicit logout clears `sessionStorage`; reload restores token from `sessionStorage` and server revalidates before enabling controls;
- read-only safe page works without token;
- secrets/tokens are redacted from safe errors/Audit/telemetry;
- installer/setup/readiness authorization unchanged;
- Work 0027 Gemini/OpenAI/provider/model state unchanged.

Use production `.gs` logic in tests; no parallel auth implementation in the harness.

## Validation and runtime bounds

Run focused tests, then at minimum `npm run check`, `npm run check:bundle`, `python tools/validate_agent_foundation.py`, `git diff --check`, reproducible bundle generation, public-surface/security/secret checks.

Provider calls are prohibited:

```text
OPENAI_LIVE_CALLS: 0
GEMINI_LIVE_CALLS: 0
FULL_OUTPUT_LIVE_CALLS: 0
API_KEY_CHANGES: 0
PROVIDER_MODEL_POLICY_CHANGES: 0
EXISTING_STORE_OR_BUSINESS_SOURCE_MUTATIONS: 0
SOURCE_DELIVERY: max 1
SOURCE_READBACK: max 1
IMMUTABLE_VERSION: max 1 / expected 74
SAME_PRIVATE_WEB_APP_UPDATE: max 1 / 73 -> 74
VERSION_75_PLUS: prohibited
VERSION_67: prohibited
```

Before deployment, follow `docs/operations/apps-script-web-app-deployment.md` and prove the exact identity chain.

## Target-runtime acceptance

After deterministic PASS:

1. deliver/read back exact tested source once;
2. create at most version 74 and update the same verified private Web App once from 73 to 74;
3. verify Root and AI Provider Settings render/bootstrap;
4. verify safe page data remains readable while locked;
5. using the temporary bootstrap password supplied in the dispatch prompt, Codex initializes shared auth through the normal Web App UI under the existing legacy bootstrap authority;
6. explicitly end admin mode/reload and confirm the still-allowlisted Google account alone has `canMutate=false`;
7. Codex unlocks through the normal Web App UI using the supplied temporary password and confirms server-validated `canMutate=true`;
8. reload and confirm `sessionStorage` persistence plus server revalidation;
9. exercise the **password-change UI without changing to a real secret** only if a reversible synthetic value is needed for proof; otherwise prove rotation deterministically and leave the runtime password at the supplied temporary bootstrap value for the user to change after introduction;
10. explicitly logout and confirm locked state;
11. do not invoke provider/model/sync operations.

A second real Google account is not required; account independence is proved deterministically with fake session identities.

## Stop / reset

Stop on plaintext leakage, bootstrap claim by non-admin, account-only authorization after initialization, Google-identity-bound token, timed-expiry logic, unbounded session storage, failed deterministic auth after one coherent repair, uncertain deployment identity, or exhausted delivery/version/deployment budget.

Do not add MFA, Groups, timed expiry, retry lockout, device binding, provider changes or unrelated security work.

## Delivery

Update CODEX-02 report, Work report/dispatches/plan/registry/runtime locator and PR body. Commit/push scoped changes. Keep PR #38 Draft/Open/unmerged; do not merge.

Return:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
```
