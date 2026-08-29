# Work 0020 dispatch control

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-15`
BALL: `CODEX`
STATUS: `RETURNED`

## Active dispatch

### 0020-CODEX-15 — RETURNED; BLOCKED

- mode: `INVESTIGATION -> BUILD / QUALIFICATION`;
- route: `C`;
- purpose: isolate whether the remaining greater-than-ten-minute query latency is specific to Gemini Interactions + File Search or to Gemini File Search more generally, select one supported normal query transport only from decisive target-runtime evidence, and complete the Pitchbook/lifecycle gates if possible;
- one active hypothesis: the CODEX-14 application lifecycle is now correct, while the pathological pending state is specific to the current Interactions + File Search execution path; one officially supported Generate Content + File Search query against the same indexed synthetic source should distinguish the provider path;
- fastest safe decisive action: one read-only POLL of the existing CODEX-14 job, followed only if needed by the evidence-gated Generate Content adapter and one live synthetic query;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-15-gemini-provider-path-isolation-and-final-qualification-instruction.md`;
- starting ref: use the exact branch head supplied in the ChatGPT dispatch prompt;
- recommended model: `Sol High`, because the remaining decision spans live provider behavior, endpoint selection, citation normalization, latency acceptance, and bounded final qualification;
- preserve all accepted CODEX-03 through CODEX-14 source, upload, reconciliation, Meeting-query, request-profile, application-lifecycle, and UX evidence;
- no blind Interactions retry, model downgrade, Store split/rebuild, reindex for diagnosis, chunking change, OpenAI call, FULL_OUTPUT rerun, paid service-tier change, new Web App/Library/webhook/public debug route, fresh key/project, or current-main integration;
- Codex final chat must begin and end with the required `WORK_ID / DISPATCH_ID / BALL / STATUS` block.

Returned evidence:

- the existing CODEX-14 opaque job was polled once and was expired;
- deterministic Generate Content + File Search validation passed;
- exact tested source was delivered once, immutable version `54` was created,
  and the same private Web App was updated in place;
- exactly one synthetic Pitchbook query returned the safe service-unavailable
  category after `83364ms` with zero authoritative citations;
- metadata/lifecycle/final-integrity dependent gates were not run;
- no retry, reindex, Store rebuild, model/credential change, or new deployment
  was performed;
- classification: `BLOCKED / GEMINI_FILE_SEARCH_PROVIDER_PATH`;
- report:
  `docs/handoffs/0020-CODEX-15-gemini-provider-path-isolation-and-final-qualification-report.md`.

## Accepted returned dispatch

### 0020-CODEX-14 — ACCEPTED; WORK BLOCKER REMAINS

Accepted implementation evidence:

- request profile: `gemini-3.7-flash`, `background=true`, `thinking_level=low`, `max_output_tokens=2048`;
- short START and one-GET-per-POLL lifecycle; no same-call sleep loop;
- opaque server-side resumable state, actor binding, identical-pending dedupe, terminal idempotency;
- immediate browser feedback, previous-result preservation, adaptive polling, reload resume, manual recheck, and no false timeout;
- deterministic validation `301/301 PASS`; temporal/public-surface/diff checks PASS; public facade `30`;
- exact source readback `78/78`; immutable Apps Script version `53`; same owner-only private Web App updated in place;
- one synthetic Pitchbook START only; reload and manual recheck reused the same opaque job;
- START returned pending in approximately `9115ms`; observed POLL maximum approximately `9691ms`;
- the same Interaction remained pending after at least `600000ms` and returned no authoritative Pitchbook citation;
- no terminal failure Audit, provider retry, source/lifecycle mutation, OpenAI call, FULL_OUTPUT rerun, Store/deployment/Library expansion, or permission change.

Commit identity:

```text
implementation commit: f63cb59d990a1392dfbd7be6efbb6bcbe63fb5c5
qualification/report commit: 3935ab7c5eea4e1fe3a18574625fec4522c70e25
final returned branch head: bc8a0e8e801b4afeb828cc6a1e18087435764535
GitHub Actions/status checks: 0
```

Classification correction:

- `STATE_INTEGRITY: PASS` for absence of unintended pending-query side effects;
- Work-level `FINAL_INTEGRITY: PARTIAL`, because metadata/lifecycle gates were not run;
- `GEMINI_RUNTIME: BLOCKED / PROVIDER_LONG_RUNNING`;
- `READY: NO`; Work blocker remains.

Report:
`docs/handoffs/0020-CODEX-14-gemini-query-performance-and-ux-optimization-report.md`

## Late local evidence

### 0020-CODEX-13 — EXECUTED LOCALLY / RETURNED / SUPERSEDED

The user later supplied a CODEX-13 return showing:

- cross-request Gemini background lifecycle PASS;
- one Pitchbook Interaction remained `in_progress` at the bounded limit;
- no authoritative citation;
- local commit `429ed454d59e01353a68d42e4322fc5fe13787f1` was not pushed because the remote branch had advanced.

GitHub does not contain that commit, so its exact diff is not independently GitHub-authoritative. Its useful lifecycle behavior is superseded by and materially represented in the pushed CODEX-14 implementation. Do not execute or push CODEX-13 separately.

## Earlier accepted evidence

- CODEX-11: both uncertain Meeting documents reconciled without uncertain-row upload/delete; one grounded Meeting query succeeded with three authoritative citations; one synthetic TXT Pitchbook indexed.
- CODEX-12: synchronous and same-call background polling failure modes were established; no provider terminal failure was shown.
- CODEX-10 and earlier: provider foundation, sourceType-bounded sync, direct Blob upload, schema `6`, five Backend sheets, and FULL_OUTPUT evidence remain accepted as recorded in their reports.

## GitHub note

Current `main` has advanced independently and the Work branch is behind it. Do not mix main integration into CODEX-15 provider-path diagnosis. Integrate latest main only after the runtime blocker closes and before final Work merge.

Only one active Codex dispatch may exist.

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-15`
BALL: `CODEX`
STATUS: `READY`
