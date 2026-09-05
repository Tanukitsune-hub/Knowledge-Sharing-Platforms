# Shared administrator password mode

Status: DECIDED
Decision date: 2026-09-05
Work: 0028

## Decision

Knowledge Share management UI must not depend on one named Google account for routine administrator operations.

For the AI Provider Settings management page:

- any user who is already authorized to use the Web App may open the page and view the existing safe/redacted status;
- administrator mutations require a single shared administrator password;
- anyone who knows that password may unlock administrator mode, regardless of their Google account or email;
- there is no time-based automatic administrator-session expiry;
- unlock persists for the browser page session using `sessionStorage`, not `localStorage`;
- explicit `管理者モードを終了` removes the browser token;
- the UI includes shared administrator password change;
- changing the shared password invalidates all previously issued administrator tokens;
- password plaintext must never be persisted in product source, Script Properties, Sheets, logs, Audit or browser storage.

The user explicitly prefers this simple trusted-team model over named-account administration, Google Group administration, MFA, timed expiry, or lockout mechanisms.

## Server-side credential contract

The server stores only non-plaintext credential material in Script Properties: a random salt, a password verifier, a random token-signing secret, and a credential generation/version. Values are never returned through safe admin-data APIs.

Password verification must use an Apps-Script-native digest/HMAC design with a random salt and constant-time comparison. The purpose is to avoid plaintext credential persistence; a script editor is already a privileged operator and is outside this Web App password boundary.

A successful unlock returns an opaque signed administrator-session token containing no email/account identity and no expiry timestamp. The token is signed server-side and includes the current credential generation plus a random nonce. Every administrator mutation verifies the token server-side. Credential rotation increments the generation so all earlier tokens fail.

The client stores only the opaque session token in `sessionStorage`. It must never store the password. No token or real secret password may appear in URLs, console output, errors, Audit rows or telemetry.

## Bootstrap and migration

Existing installations already have account/email-based AI administrator authorization. That mechanism is retained only as a one-time bootstrap gate while no shared administrator credential exists:

1. an existing legacy account administrator may set the initial shared password once through the management UI;
2. after shared-password initialization succeeds, the legacy account/email alone no longer grants AI Provider Settings mutation rights;
3. all normal future AI Provider Settings mutations require a valid shared administrator-session token.

For the current personal-DEV Work 0028 qualification, the user explicitly authorized ChatGPT to disclose a temporary bootstrap password to Codex so Codex can complete bootstrap/unlock without a USER handoff. That runtime value is not a product default, must not be hard-coded, and will be changed by the user after introduction. Product code must support arbitrary future passwords entered through the UI.

Password change is part of Work 0028. It requires an already valid shared administrator session, rotates the verifier/generation, invalidates previous tokens, and leaves the current browser in a coherent post-change state.

Emergency forgotten-password recovery is not a normal Web App flow in Work 0028. A script owner can perform a separately documented operator recovery if ever required.

## Boundaries

This decision changes Web App management authorization, not Web App access itself. It does not make the Web App public.

It does not remove or weaken account/owner checks protecting editor-only installer, setup, deployment, or readiness wrappers. Those higher-privilege operator paths keep their existing security contract.

It does not authorize provider activation, API-key rotation, confidential indexing, billing changes, company rollout, or migration.
