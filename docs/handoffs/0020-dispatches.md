# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-13`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-13 — READY

- mode: `INVESTIGATION -> BUILD / QUALIFICATION`;
- route: `C`;
- purpose: replace the remaining same-request Gemini background polling loop with a secure resumable cross-request query lifecycle, then finish the grounded Pitchbook query and dependent lifecycle/final-integrity gates;
- one active hypothesis: CODEX-12 used `background=true` but still waited inside one Apps Script invocation for `24 * 5s`, generated local `AI_QUERY_TIMEOUT`, and discarded resumability; documented terminal `incomplete` is also not classified as terminal;
- fastest safe decisive action: reproduce those two lifecycle gaps deterministically, then implement one coherent START/POLL flow through the existing `searchKnowledge` facade if practical;
- expected implementation: one provider Interaction creation, server-side retained Interaction identity behind an opaque expiring token, later short GET polls of that same Interaction, exactly one terminal Audit outcome, no failure Audit for pending polls;
- target runtime: existing private Apps Script V8 Web App / Gemini Interactions + File Search / isolated synthetic Pitchbook;
- live budget: one new Pitchbook Interaction creation after validated delivery; repeated GET polls of that same Interaction only; bounded observation up to 10 minutes; no second query creation;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-13-resumable-gemini-query-lifecycle-and-final-qualification-instruction.md`;
- recommended model: `Sol High` because the unresolved work spans provider lifecycle, Apps Script execution boundaries, browser polling, state ownership, and final runtime qualification;
- preserve all accepted CODEX-03 through CODEX-12 evidence;
- no OpenAI live call, FULL_OUTPUT rerun, broad sync, new Store/Web App/Library/public debug endpoint, raw Interaction ID as client authorization token, repeated new Pitchbook query, or current-main integration during this bounded repair;
- Codex final chat must begin and end with the exact `WORK_ID / DISPATCH_ID / BALL / STATUS` block required by the instruction.

## Returned dispatch — CODEX-12

### 0020-CODEX-12 — RETURNED / BLOCKER

Accepted evidence:

- original synchronous Pitchbook query classified as Apps Script max-execution timeout after `360.804s`;
- background Interaction request-shape repair deterministic PASS;
- focused `43/43`, repository `294/294`, temporal/public/diff PASS, public facade `30`;
- exact source readback `78/78`, immutable version `51`, same private Web App updated in place;
- one final Pitchbook query returned safe `AI_QUERY_TIMEOUT` after `134.96s`, one failure Audit, zero citations;
- no retry, lifecycle mutation, OpenAI call, FULL_OUTPUT rerun, broad sync, new Store/deployment/Library, or main integration;
- final commit: `6373ec1bb70f341eb6878ede51b17eb0cfc4286a`;
- GitHub Actions runs `0`; commit status checks `0`.

Interpretation after ChatGPT review:

- `AI_QUERY_TIMEOUT` is application-generated after the local 24-poll deadline, not a demonstrated provider terminal failure;
- current code still ties background execution to one Apps Script call and does not preserve resumability after the local deadline;
- documented Gemini Interaction terminal status `incomplete` is not classified as terminal.

Report:
`docs/handoffs/0020-CODEX-12-pitchbook-query-outcome-and-final-qualification-report.md`

## Earlier accepted evidence

- CODEX-11: Gemini Document reconciliation PASS for both affected Meetings; grounded Meeting query PASS with three citations; synthetic TXT Pitchbook Indexed.
- CODEX-10: authenticated private Web App administrator SYNC reached real Gemini execution.
- CODEX-09 and earlier: sourceType bounded sync, direct Blob transport, provider foundation, schema 6 / five Backend sheets, and FULL_OUTPUT evidence accepted as recorded in individual reports.

## GitHub note

Current `main` has advanced independently to include Work 0024 Codex-return identity governance. Do not merge/rebase main during CODEX-13. Integrate latest main only after the runtime blocker closes and before final Work 0020 merge.

Only one active Codex dispatch may exist.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-13`
BALL: `CODEX`
STATUS: `READY`
