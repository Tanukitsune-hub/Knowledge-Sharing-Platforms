# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-09`
BALL: `CODEX`
STATUS: `RETURNED / BLOCKER`
MODE: `BUILD / QUALIFICATION`

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:
`docs/handoffs/0020-CODEX-09-source-type-bounded-sync-and-gemini-final-qualification-instruction.md`

## Primary outcome

Deliver one provider-neutral Knowledge Search core with exactly three routes:

```text
ChatGPT
Gemini
全文出力
```

Gemini is the personal-DEV live provider. OpenAI is deliberately deferred/disabled. File Search scope is Meeting + Pitchbook/source; FULL_EXPORT body is Meeting Google Docs full text with optional Pitchbook references only.

## Accepted evidence

Closed absent material contradiction:
- CODEX-03: schema 6 / five Backend sheets / FULL_OUTPUT runtime and canonical output parity / disabled-provider no-failover / final integrity PASS;
- CODEX-04: one isolated Gemini Store, future zero-code OpenAI activation deterministic PASS, OpenAI uncalled;
- CODEX-05: safe transport-stage diagnostics + bounded retry, repository `274/274 PASS`, version 45;
- CODEX-06: caller `Content-Length` removed, repository `277/277 PASS`, version 46;
- CODEX-07: candidate-selection/direct transport hardening deterministic PASS, repository `282/282 PASS`, version 47;
- CODEX-08: direct Blob path deterministic PASS, focused `39/39`, repository `280/280`, temporal/public/diff PASS; no live Gemini call or deployment occurred.

Do not rerun FULL_OUTPUT or live-call OpenAI.

## Strategy Reset after CODEX-08

CODEX-08 proved the normal provider-neutral selector is not defective. The combined Meeting+Pitchbook queue intentionally sorts eligible items using the existing lifecycle priority and oldest-first ordering. With batch size `1`, an older eligible Pitchbook legitimately preceded two eligible Pending Meetings.

Do not change normal production ordering to Meeting-first. That would create starvation risk and would be a product behavior change merely to satisfy qualification.

The correct bounded mechanism is to extend the existing provider-neutral sync `options` plus existing administrator `SYNC` action with optional `sourceType`:

```text
blank -> current combined queue unchanged
Meeting -> eligible Meetings only, then existing sort/slice
Pitchbook -> eligible Pitchbooks only, then existing sort/slice
```

The source-type filter must be applied before sort/slice. No new public/debug function is needed.

Active hypothesis:

> An administrator-only sourceType constraint on the existing sync path will select exactly one eligible Meeting under batch size 1 without touching unrelated Pitchbooks. The already logic-validated direct Blob transport can then be live-qualified, followed by one bounded Pitchbook path.

## CODEX-09 completion boundary

1. Extend selector with optional source-type constraint; blank behavior unchanged.
2. Extend `kspRunProviderNeutralAiSync_(environment, options)` with validated `options.sourceType`.
3. Extend existing admin `SYNC` mutation to pass optional `input.sourceType`; preserve server-side admin authorization and safe summary.
4. Add deterministic regression tests for default ordering, Meeting/Pitchbook filtering-before-slice, invalid filter fail-closed, security, and direct Blob transport.
5. Run focused tests, `npm run check`, temporal/public-surface, `git diff --check`.
6. Deliver exact tested source once; create one immutable Apps Script version; update same private Web App once.
7. With guarded batch size `1`, admin `SYNC sourceType=Meeting`: prove selected=1 Meeting and no Pitchbook processed.
8. Gate A: exactly one real Meeting Blob finalize; require ACTIVE Gemini document + Backend Indexed + no duplicate.
9. Gate B: one Meeting grounded query with authoritative citation.
10. Admin `SYNC sourceType=Pitchbook`: prove selected=1 Pitchbook and no Meeting processed; index/query one small synthetic TXT Pitchbook.
11. Prove exact metadata filter + update/Inactive/Reactivate/delete-rebuild lifecycle using bounded source-type sync where useful.
12. Restore batch value/type, `AI_SYNC_ENABLED=false`; OpenAI disabled/uncalled; triggers 0; final integrity PASS.

## CODEX-09 bounded result

The source-type implementation passed deterministic validation (`45/45` focused, `286/286` repository check, temporal/public-surface/diff checks) and the exact tested source was delivered once. The existing private Web App was updated in place to immutable version `48` with no new deployment or Library mutation.

The accepted synthetic DEV state had two eligible Active Meetings and older eligible Pitchbooks. The batch setting was temporarily changed from numeric `10` to numeric `1`, then restored/read back as numeric `10`. The existing `/exec` rendered, but the exact administrator SYNC invocation with `sourceType=Meeting` could not be executed: both available Apps Script execution routes returned the platform permission error before the function ran. No Gemini request or application-data mutation occurred. This is an execution-surface/automation limitation, so Gate 0A and all dependent Gemini gates remain blocked/not run.

Report: `docs/handoffs/0020-CODEX-09-source-type-bounded-sync-and-gemini-final-qualification-report.md`

Stop on the first new Meeting Gate-A local/provider/operation/document-readback failure. Do not perform unrestricted broad sync merely to reach a test source.

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
