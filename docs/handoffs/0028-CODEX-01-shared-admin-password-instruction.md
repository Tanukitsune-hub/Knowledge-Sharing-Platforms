# Work 0028 — CODEX-01 shared administrator password instruction

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-01
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

## Outcome

Implement a shared-password administrator mode for the existing AI Provider Settings management page.

Any user already authorized to access the Knowledge Share Web App must be able to open/read the page. Existing redaction remains. Routine mutation authorization after migration must depend only on a valid shared administrator session, not Google account/email.

There is no time-based automatic administrator-session expiry.

## Existing behavior to replace narrowly

Current server behavior:

- `getAiProviderAdminData()` is public/read-only and returns `canMutate` from `kspIsAiProviderAdministrator_`;
- `kspIsAiProviderAdministrator_` checks configured `adminEmails` against `Session.getActiveUser()` / `Session.getEffectiveUser()`;
- `kspMutateAiProviderSettings_` asserts that account-based administrator check before all provider/model mutations;
- the client disables mutation controls when `canMutate` is false.

Do not remove the legacy account check globally. Preserve it as the bootstrap authority only while the shared admin password is unconfigured, and preserve any other high-privilege operator uses outside the AI Provider Settings management flow.

## Required authentication contract

Implement a small reusable shared-admin authentication primitive with these properties:

1. **Credential persistence**
   - Never persist plaintext password.
   - Store only server-side non-plaintext credential material in Script Properties: random salt, password verifier, random token-signing secret, and credential generation/version.
   - Use Apps-Script-native digest/HMAC primitives and constant-time comparison.
   - Do not return salt/verifier/signing secret/generation values through normal client data.

2. **Bootstrap**
   - While no shared credential exists, only the existing legacy account administrator may initialize it.
   - A non-legacy-admin user must not be able to claim/bootstrap the credential.
   - Initial password is entered and confirmed in the Web App UI.
   - After initialization, legacy account/email identity alone no longer authorizes AI Provider Settings mutations.

3. **Unlock/session**
   - Correct shared password returns an opaque signed admin-session token.
   - Token contains no Google email/account identity and no expiry timestamp.
   - Token is signed server-side and bound to the current credential generation; include a random nonce so tokens are opaque/non-deterministic.
   - No server-side unbounded session list/storage.
   - Client stores only the opaque token in `sessionStorage`; never store password in browser storage.
   - Page reload within the same browser page session may reuse the token.
   - Explicit logout removes the client token and returns the UI to locked state.
   - No timer/TTL/30-minute expiration logic.

4. **Mutation authorization**
   - Every existing AI Provider Settings mutation validates the shared token server-side after initialization.
   - Missing, malformed, tampered, old-generation or wrong token fails closed.
   - The mutation result must not depend on active/effective Google email after shared auth is configured.
   - Do not rely on client-side disabled buttons as the security boundary.

5. **Password change**
   - Requires a valid shared admin session.
   - New password is entered/confirmed in the UI and never persisted client-side.
   - Credential generation increments; all earlier tokens become invalid.
   - Return a fresh valid token for the current browser after a successful password change, or require immediate re-unlock; choose the simpler coherent UX and cover it in tests.

6. **Read-only management**
   - Safe provider/model status remains readable without shared unlock.
   - `getAiProviderAdminData` (or equivalent) accepts an optional admin token so the server can report whether the current browser session is authorized.
   - Do not expose API keys, Store IDs, provider document IDs, verifier material, tokens, account allowlists, private URLs or other sensitive identifiers.

## UI requirements

Keep the current AI Provider Settings page and add only the smallest coherent admin-mode controls:

- locked/unlocked status;
- initial shared-password setup when applicable;
- password input to unlock;
- explicit `管理者モードを終了`;
- password change while unlocked.

When locked, existing mutation controls remain disabled but safe status is readable. When unlocked, existing mutation controls become available based on server-validated session state.

Password fields use appropriate password autocomplete semantics. Never render or echo the password/token.

## Public-surface and secret handling

Any new browser-callable function must be intentionally allowlisted by the repository public-surface rules and guarded appropriately. Prefer the minimum new public surface. Do not create an unguarded private-helper wrapper.

Never include password, token, verifier, salt, signing secret, private URL/ID or runtime account identity in logs, Audit, errors, telemetry, screenshots, reports, fixtures, commits, test snapshots or PR text.

Do not ask the user to paste a password into chat, Codex, terminal or GitHub. If runtime initialization requires user input, return/hold BALL: USER / STATUS: ACTION_REQUIRED and instruct the user only to type it directly into the Web App password field. Resume the same `0028-CODEX-01` afterward.

## Required deterministic tests

At minimum cover:

- no shared credential -> legacy admin may bootstrap, non-admin may not;
- password plaintext absent from persisted state and server responses;
- wrong password rejected;
- correct password yields valid token;
- token is account-identity-independent: same valid token authorizes under differing fake active/effective emails;
- allowlisted legacy account without token is rejected after initialization;
- missing/tampered/malformed token rejected;
- token contains no email/account identity and no expiry field;
- no timeout/clock check affects token validity;
- valid token authorizes representative existing AI provider mutation path in fake environment;
- password rotation invalidates old token and new credential/session works;
- explicit client logout clears sessionStorage state;
- reload/bootstrap reads token from sessionStorage and server revalidates before enabling mutations;
- read-only safe page data remains available without token;
- token/password/verifier values are redacted from safe error/audit/telemetry helpers;
- installer/setup/readiness authorization behavior is unchanged;
- Work 0027 Gemini/OpenAI model/provider state logic is unchanged.

Use the same production `.gs` logic in tests; no parallel auth implementation in the test harness.

## Deterministic validation

Run focused tests first, then at minimum:

- `npm run check`
- `npm run check:bundle`
- `python tools/validate_agent_foundation.py`
- public-surface/security/secret checks included by canonical validation
- `git diff --check`
- build twice and confirm byte-identical generated bundle if the bundle changes.

Inspect final diff for secret or account-identity leakage.

## Runtime bounds

Provider calls are prohibited in CODEX-01.

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

Before source delivery/deployment, follow `docs/operations/apps-script-web-app-deployment.md` and prove the exact identity chain. Stop on first source/deployment identity failure.

## Target-runtime acceptance sequence

After deterministic PASS:

1. deliver exact tested source once and read back exact deployable parity;
2. create at most immutable version 74 and update the same verified private Web App once from 73 to 74;
3. verify Root and AI Provider Settings render/bootstrap with no application-blocking console errors;
4. verify the management page is safely readable while locked;
5. if shared credential is unconfigured, ask the USER to type/confirm the chosen initial password directly in the Web App. Do not observe/copy/report the value;
6. after initialization, explicitly clear/end admin mode and reload the safe admin data; confirm the still-allowlisted current Google account alone has `canMutate=false`;
7. ask the USER to type the same shared password directly in the Web App unlock field; confirm server-validated `canMutate=true`;
8. reload the page and confirm the unlocked state persists via `sessionStorage` and is server-revalidated;
9. explicitly end administrator mode and confirm `canMutate=false` again;
10. do not call any provider or mutate model/provider/business state during this campaign.

Account-independence of mutation authorization and password-rotation behavior are proven deterministically with fake session identities; a second real Google account is not required for Work acceptance.

## Stop / Strategy Reset

Stop and return `BLOCKED_PRODUCT_DEFECT` or precise blocker if:

- plaintext password/token leaks or is persisted improperly;
- non-admin can bootstrap before initialization;
- allowlisted Google identity still grants mutation after shared credential initialization without token;
- valid token requires matching Google identity;
- token requires time-based expiry despite the user decision;
- token implementation requires unbounded server-side session persistence;
- deterministic auth tests fail after one coherent repair;
- source/runtime identity becomes uncertain;
- one delivery/version/deployment budget would be exceeded.

Do not add MFA, groups, timed expiry, rate-limit/lockout architecture, device binding or unrelated security features in the same Work.

## Delivery

Update:

- `docs/handoffs/0028-CODEX-01-shared-admin-password-report.md`
- `docs/handoffs/0028-report.md`
- `docs/handoffs/0028-dispatches.md`
- `docs/planning/work0028-shared-admin-password.md`
- `docs/planning/work-registry.md`
- runtime locator if a new version is deployed
- PR body/status

Commit and push scoped changes. Keep PR Draft/Open/unmerged. Codex must not merge.

Return with:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

If direct user password entry is required before completion, instead return/hold:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-01
BALL: USER
STATUS: ACTION_REQUIRED
```

and resume the same Dispatch after the user acts.
