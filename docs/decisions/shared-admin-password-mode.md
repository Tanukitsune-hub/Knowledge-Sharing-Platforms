# Shared administrator password mode

Status: DECIDED
Decision date: 2026-09-05
Work: 0029

## Decision

Routine AI Provider Settings administration uses one shared administrator password instead of a named Google account after bootstrap.

- any user already authorized to use the Knowledge Share Web App may open the safe/redacted management page;
- anyone who knows the shared password may unlock administrator mode regardless of Google account/email;
- there is no time-based automatic expiry;
- the browser stores only an opaque signed admin token in `sessionStorage`;
- explicit logout clears the browser token;
- password rotation invalidates all earlier tokens;
- password plaintext is never persisted;
- installer/setup/deployment/readiness owner/account authorization is unchanged.

Server-side Script Properties hold only non-plaintext verifier/signing material and credential generation. Every AI Provider Settings mutation validates the shared token server-side.

## Collision recovery

A branch-only shared-admin effort was initially assigned Work 0028, but current `main` already owns Work 0028 for UI/UX surface refinement. That branch identity is invalid and superseded. Work 0028 remains the UI/UX Work without modification. This shared-admin outcome is canonicalized as Work 0029.

The already observed version-74 personal-DEV shared-admin qualification is preserved as evidence, but the canonical Work 0029 source must use Work ID 0029 and be integrated from the latest main before merge.
