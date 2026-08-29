# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-14`
BALL: `CHATGPT`
STATUS: `RETURNED / BLOCKER`

## Active dispatch

### 0020-CODEX-14 — RETURNED / BLOCKER

- mode: `BUILD / QUALIFICATION`;
- route: `C`;
- purpose: implement the user-approved coherent Gemini query performance and UX architecture, then close the grounded Pitchbook and dependent lifecycle/final-integrity gates;
- user decision: retain the latest stable Flash model and optimize the surrounding request profile, File Search use, Apps Script lifecycle, resumability, duplicate prevention, browser feedback, and safe timing evidence;
- model contract: pinned stable `gemini-3.7-flash`;
- request profile: `background=true`, `generation_config.thinking_level=low`, `generation_config.max_output_tokens=2048`;
- query lifecycle: one short START, opaque server-owned token, later short POLL calls of the same Interaction, no same-call sleep loop, exactly one terminal Audit outcome;
- pending provider statuses: `queued`, `in_progress`;
- terminal non-success statuses: `requires_action`, `failed`, `cancelled`, `incomplete`, `budget_exceeded`;
- UX contract: immediate local feedback, adaptive polling, no false timeout while provider remains pending, duplicate START prevention, `sessionStorage` resume after reload, manual result check after automatic polling stops;
- safe telemetry: latency and numeric token usage only, no question/source/provider IDs or raw payloads;
- fastest safe decisive action: reproduce the current unoptimized request/lifecycle gaps, then implement the single coherent profile/lifecycle/UX change in the committed instruction;
- target runtime: existing private Apps Script V8 Web App / Gemini Interactions + File Search / isolated synthetic Pitchbook;
- live budget: one new narrow Pitchbook Interaction after validated delivery; repeated GETs of only that Interaction; no second query creation;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-14-gemini-query-performance-and-ux-optimization-instruction.md`;
- design decision: `docs/decisions/gemini-search-latency-and-ux-architecture.md`;
- recommended model: `Sol High` because the implementation spans provider request semantics, secure cross-request state, Apps Script execution boundaries, browser UX, and target-runtime qualification;
- preserve all accepted CODEX-03 through CODEX-12 evidence;
- no OpenAI live call, FULL_OUTPUT rerun, Store split/reindex/chunking experiment, paid Priority tier, browser API key, new Web App/Library/public debug endpoint, repeated new Pitchbook query, or current-main integration during this bounded implementation;
- Codex final chat must begin and end with the exact identity block required by the instruction.
- deterministic validation: `301/301 PASS`; temporal/public-surface/diff checks PASS; public facade `30`;
- exact source readback `78/78`; one immutable Apps Script version `53`; same private Web App updated in place;
- one synthetic Pitchbook START, one reload/resume, and one manual recheck used the same opaque job; no second START;
- the Interaction remained pending at the bounded observation limit, so the dispatch stopped as `PROVIDER_LONG_RUNNING` without citation/lifecycle retries;
- detailed report: `docs/handoffs/0020-CODEX-14-gemini-query-performance-and-ux-optimization-report.md`;
- final Work completion gates remain blocked on provider terminal success; no OpenAI/FULL_OUTPUT/lifecycle/new deployment action occurred.

## Superseded dispatch

### 0020-CODEX-13 — SUPERSEDED / NOT EXECUTED

- CODEX-13 was committed as a narrower cross-request resume-path repair;
- before execution, the user explicitly required broader end-to-end speed and UX optimization while retaining the latest stable Flash model;
- the execution contract therefore changed materially and received the next Dispatch ID;
- do not execute, reuse, or report under CODEX-13;
- instruction retained for history: `docs/handoffs/0020-CODEX-13-resumable-gemini-query-lifecycle-and-final-qualification-instruction.md`.

## Returned dispatch

### 0020-CODEX-12 — RETURNED / BLOCKER

Accepted evidence:

- original synchronous Pitchbook query reached Apps Script maximum execution after `360.804s`;
- background Interaction request-shape repair deterministic PASS;
- focused `43/43`, repository `294/294`, temporal/public/diff PASS, public facade `30`;
- exact source readback `78/78`, immutable version `51`, same private Web App updated in place;
- one post-repair Pitchbook query returned application `AI_QUERY_TIMEOUT` after `134.96s`, one failure Audit, zero citations;
- no provider terminal failure was established;
- no retry, lifecycle mutation, OpenAI call, FULL_OUTPUT rerun, broad sync, new Store/deployment/Library, or main integration;
- final commit: `6373ec1bb70f341eb6878ede51b17eb0cfc4286a`;
- GitHub Actions runs `0`; commit status checks `0`.

Interpretation after ChatGPT review and user decision:

- CODEX-12 still polled for `24 * 5s` inside one Apps Script call and generated a local timeout;
- the request omitted an explicit thinking level and output-token cap;
- the browser could not securely resume after reload or prove duplicate START suppression;
- `queued` and `budget_exceeded` were not covered by a complete current status machine;
- the observed timeout is not evidence that Gemini 3.7 Flash, File Search indexing, or the small synthetic Pitchbook failed.

Report:
`docs/handoffs/0020-CODEX-12-pitchbook-query-outcome-and-final-qualification-report.md`

## Earlier accepted evidence

- CODEX-11: Gemini Document reconciliation PASS for both affected Meetings; grounded Meeting query PASS with three citations; synthetic TXT Pitchbook Indexed.
- CODEX-10: authenticated private Web App administrator SYNC reached real Gemini execution.
- CODEX-09 and earlier: sourceType bounded sync, direct Blob transport, provider foundation, schema 6 / five Backend sheets, and FULL_OUTPUT evidence accepted as recorded in individual reports.

## GitHub note

Current `main` has advanced independently, including Work 0024 Codex-return identity governance. Do not merge/rebase main during CODEX-14. Integrate latest main only after the runtime blocker closes and before final Work 0020 merge.

Only one active Codex dispatch may exist.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-14`
BALL: `CHATGPT`
STATUS: `RETURNED / BLOCKER`
