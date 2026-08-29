# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-10`
BALL: `CODEX`
STATUS: `READY`
MODE: `QUALIFICATION` with one bounded UI repair fallback

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:
`docs/handoffs/0020-CODEX-10-webapp-admin-sync-and-gemini-final-qualification-instruction.md`

## Primary outcome

Deliver and qualify one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

Gemini is the personal-DEV live provider. OpenAI is deliberately deferred/disabled. File Search scope is Meeting + Pitchbook/source; FULL_EXPORT body is Meeting Google Docs full text with optional Pitchbook references only.

## Accepted evidence — closed absent material contradiction

- CODEX-03: schema `6`, exactly five Backend sheets, FULL_OUTPUT runtime/canonical package parity, disabled-provider no-failover, final integrity PASS.
- CODEX-04: one isolated Gemini Store, future zero-code OpenAI activation deterministic PASS, OpenAI uncalled.
- CODEX-05: safe transport-stage diagnostics + bounded retry, repository `274/274 PASS`, version `45`.
- CODEX-06: caller `Content-Length` removed, repository `277/277 PASS`, version `46`.
- CODEX-07: transport/candidate hardening deterministic PASS, repository `282/282 PASS`, version `47`.
- CODEX-08: direct Blob path deterministic PASS, focused `39/39`, repository `280/280`, temporal/public/diff PASS; normal combined queue ordering confirmed.
- CODEX-09: optional administrator `sourceType` contract deterministic PASS, focused `45/45`, repository `286/286`, temporal/public/diff PASS; exact source readback `78/78`; existing private Web App version `48`; batch restored to numeric `10`.

Do not rerun FULL_OUTPUT. Do not live-call OpenAI. Do not reopen accepted selector/transport design absent contradictory evidence.

## CODEX-09 authoritative blocker

CODEX-09 did not reach Gemini. The deployed `/exec` rendered and the administrator settings surface was visible, but both Apps Script Execution API routes rejected the attempted administrator function invocation before function execution with a platform permission error. No Gemini request or application-data mutation occurred.

This proves only an execution-surface/automation limitation. It does not prove that the deployed Web App browser/server bridge is unavailable, and it is not evidence of an application/Gemini defect.

## Strategy Reset for CODEX-10

Closed implementation facts:
- `sourceType` blank preserves the combined Meeting+Pitchbook queue;
- `sourceType=Meeting` / `Pitchbook` filters before existing sort/slice;
- invalid source types fail closed;
- server-side administrator authorization remains mandatory;
- normal browser code already calls the public `mutateAiProviderSettings` facade through the Web App for administrator operations.

Active hypothesis:

> The authenticated private Web App page context can invoke the existing `mutateAiProviderSettings` facade with `{ action: 'SYNC', sourceType: 'Meeting' }`, avoiding the separate Apps Script Execution API permission restriction.

Fastest safe decisive action:
- use already deployed version `48` with zero source/deployment change first;
- temporarily set batch size to numeric `1` using the accepted guarded mechanism;
- invoke the existing Web App browser/server bridge with `sourceType=Meeting`;
- if the available browser harness cannot send the custom payload before any provider execution, add only a minimal administrator `All / Meeting / Pitchbook` sync-scope control to the existing AI Provider Settings page, with no new public/debug endpoint, then one tested source delivery/version/Web App update maximum.

## Remaining completion gates

1. Bounded Web App administrator SYNC `sourceType=Meeting`, batch `1`.
2. One Gemini Meeting index/finalize with ACTIVE Document + Backend `Indexed` + no duplicate.
3. One grounded Meeting query with authoritative citation.
4. Bounded Web App administrator SYNC `sourceType=Pitchbook`, batch `1`, using only synthetic/non-confidential source.
5. One Pitchbook index and grounded query with authoritative citation.
6. Exact metadata filter.
7. Update -> reindex without duplicate.
8. Inactive removal/exclusion.
9. Reactivate restoration.
10. Exact delete/rebuild of derived provider document.
11. Restore lifecycle/settings; final integrity PASS.

## Stop rules

- one actual Meeting SYNC attempt;
- one Meeting query only after Meeting index PASS;
- one actual Pitchbook SYNC attempt only after Meeting query PASS;
- one Pitchbook query only after Pitchbook index PASS;
- one optional minimal admin UI repair and one source delivery/version/Web App update maximum, only if page-context custom invocation is impossible before provider execution;
- no Apps Script Execution API retry loop;
- no unrestricted broad sync, Meeting-first priority change, queue manipulation, fake failure state, new Store, new deployment, Library mutation, new public/debug endpoint, OpenAI live call, FULL_OUTPUT rerun, or confidential data;
- stop on first new provider/runtime failure after actual application execution begins.

## GitHub evidence note

At CODEX-09 head `26188b8e97ec9600ee08fb8e8518d630c2f1714d`, GitHub had no Actions workflow run and no commit status checks. The recorded `45/45` and `286/286` results are deterministic local/report evidence, not GitHub-hosted CI evidence. Do not claim GitHub CI PASS without a real run.

## Closed contracts

- exactly five Backend sheets/schema `6`;
- normal provider-neutral queue remains combined/oldest-first when sourceType is blank;
- independent OpenAI/Gemini derived state;
- stable-ID citation resolution to authoritative Backend/Drive;
- no automatic provider failover;
- Pitchbook body is File Search input but not FULL_EXPORT body;
- no recurring trigger, confidential production data, new Store, second Web App, or Library mutation.

## Target final classification

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```

Completion Latch applies only after ChatGPT final review and merge.
