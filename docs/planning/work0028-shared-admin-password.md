# Work 0028 — portable shared-password administrator mode

WORK_ID: 0028
MODE: BUILD
ACTIVE_DISPATCH_ID: 0028-CODEX-02
BALL: CODEX
STATUS: READY

## Primary outcome

Make routine AI Provider Settings administration portable across personnel changes: any authorized Knowledge Share Web App user can view the management page, and anyone who knows the shared administrator password can unlock and perform existing administrator mutations without relying on that user's Google account/email.

No time-based automatic administrator-session expiry.

## Acceptance evidence hierarchy

1. Personal-DEV versioned Web App: management page loads read-only without an admin session; shared-password bootstrap/unlock works through the normal UI; after bootstrap the currently allowlisted Google account alone is insufficient (`canMutate=false`) while a valid shared session produces `canMutate=true`; explicit logout returns to locked state; reload within the browser page session preserves unlock via `sessionStorage`.
2. Server authorization tests: existing AI-provider mutations reject missing/wrong/old admin tokens and accept a valid token independently of active/effective Google email; password rotation invalidates prior tokens and the new credential works.
3. Credential-security tests: password is never persisted or returned; only salt/verifier/signing secret/generation are server-side; tokens contain no account identity or expiry and are never emitted into safe logs/Audit/errors.
4. UI/read-only regression: all authorized Web App users can continue viewing redacted provider/model status; secrets/private provider IDs remain absent.
5. Canonical logic/public-surface/bundle/security checks, exact source delivery/readback, and one bounded versioned Web App shell verification.

## Fastest safe decisive action

Add one reusable shared administrator-auth primitive, integrate it with the existing AI Provider Settings read/mutation path, migrate once from the existing account-admin bootstrap, test deterministic account independence, deploy one personal-DEV version, and verify the normal management UI without calling AI providers.

## Required scope

- shared password bootstrap, unlock, password change, explicit logout;
- no timer/TTL-based admin expiry;
- opaque signed session token stored only in browser `sessionStorage`;
- server-side token validation on every existing AI Provider Settings mutation;
- legacy `adminEmails` / Session identity usable only for first bootstrap while no shared credential exists;
- after bootstrap, legacy account identity alone must not authorize AI Provider Settings mutations;
- password rotation invalidates prior tokens;
- safe management page remains viewable without unlock;
- shared auth primitive reusable by future management pages without changing their authorization in this Work;
- deterministic tests for wrong password/token, different Google identities, tamper, rotation, logout state and secret redaction.

## Current personal-DEV bootstrap

The user authorized ChatGPT to disclose a temporary bootstrap password directly to Codex for this DEV campaign, eliminating a USER password-entry handoff.

- The exact temporary value is supplied in the CODEX-02 dispatch prompt.
- Codex may type it into the normal Web App setup/unlock UI.
- It is not a product default and must not be hard-coded or persisted in plaintext.
- Product code must accept arbitrary future passwords entered through the UI.
- The user will change the temporary password after introduction using the management-page password-change function.

## Non-goals

- changing Web App access/execute-as policy;
- making the Web App public;
- changing installer/setup/deployment/readiness owner/admin checks;
- Google Group/Directory administration;
- MFA, timed expiry, account lockout, password-retry throttling, IP/device binding;
- emergency forgotten-password self-service;
- Gemini/OpenAI activation, qualification, model changes, provider calls, sync, API-key rotation;
- confidential/business source writes, migration, company rollout, large-file qualification;
- unrelated UI redesign or refactor.

## Authority and change boundaries

- Branch: `agent/0028-shared-admin-password`.
- Base main: `b0efbbfd8a5ce5c2e3b3d64f5ccba56838306ef2`.
- Current accepted private Web App baseline: version 73 from Work 0027.
- Product source/tests/generated bundle may change only as required for Work 0028.
- AI provider live calls: 0.
- API-key changes: 0.
- existing Store/business-source mutations: 0.
- provider/model policy changes: 0.
- source delivery/readback: max 1.
- immutable Apps Script versions: max 1, expected version 74.
- same verified private Web App update: max 1, 73 -> 74.
- version 75 or higher: prohibited in CODEX-02.
- version 67 remains prohibited.
- real future secret passwords, verifier, salt, signing secret, admin token, private URL/ID, or account identifier may not be committed or reported.

## Closed conclusions

- Work 0027 is ACCEPTED and closed; Gemini 3.7 remains qualified-disabled and hidden.
- Current AI Provider Settings page is safely readable and currently gates mutation via `adminEmails` plus Google Session identity.
- The user explicitly chose a shared-password administrator role rather than person/account binding.
- The user explicitly chose no 30-minute or other time-based admin timeout.
- Browser-session persistence via `sessionStorage` plus explicit logout is accepted.
- Routine administrator authorization after migration must not depend on Google account/email.
- Password change must be available in the management UI.
- CODEX-01 is superseded before execution; CODEX-02 carries the temporary DEV bootstrap decision.

## Runtime qualification

After deterministic PASS and exact deployment identity proof:

1. update the same private Web App once to version 74;
2. verify Root and AI Provider Settings bootstrap with no application-blocking console errors;
3. verify the page is readable while locked;
4. Codex uses the temporary bootstrap password supplied in the dispatch prompt to initialize shared auth through the normal UI;
5. clear/remove the browser admin token and confirm the still-allowlisted Google account alone reports locked / `canMutate=false`;
6. Codex unlocks again using the same temporary password; confirm server-validated `canMutate=true`;
7. reload the page and confirm unlock persists through `sessionStorage` and is server-revalidated;
8. verify password-change behavior deterministically; leave the runtime on the temporary bootstrap value unless a reversible synthetic rotation is required for runtime proof;
9. explicitly end administrator mode and confirm the page returns to `canMutate=false`;
10. do not invoke OpenAI/Gemini/provider mutations in the runtime campaign.

Deterministic tests, not a destructive provider mutation, prove that the token authorizes the existing mutation path independent of Google identity and that password rotation invalidates old tokens.

## Strategy reset

Stop and return if any of these occurs:

- password or token is exposed/persisted outside the allowed locations;
- bootstrap can be claimed by a non-legacy-admin before initialization;
- a legacy account still authorizes provider mutation without a valid shared token after initialization;
- token validation depends on Google email/account;
- implementing no-expiry authorization requires server-side unbounded session storage;
- source/deployment identity is uncertain;
- one source delivery/version/deployment budget is exceeded;
- runtime evidence contradicts deterministic authorization behavior.

## Completion latch

Done only when the shared-password mode works end to end in personal DEV, account-only mutation authorization is removed after bootstrap, password change is implemented, required tests and source/runtime checks pass, no secret leakage or blocker remains, and GitHub/PR/handoff state is updated. Preserve Work 0027 provider state unchanged.
