# Work 0020 dispatch control

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-16`
BALL: `USER`
STATUS: `ACTION_REQUIRED`

## Active dispatch

### 0020-CODEX-16 — ACTION_REQUIRED

- mode: `QUALIFICATION`;
- route: `C` after the secret prerequisite is satisfied;
- purpose: run direct same-project Gemini controls outside Apps Script and identify whether the remaining blocker is the project/key/base model, File Search generally, the existing Store, metadata filtering, `gemini-embedding-2`, or Apps Script/`UrlFetchApp` integration;
- prerequisite: a same-project API key must be available only in the local Codex process as `GEMINI_API_KEY`;
- secret rule: never paste, print, log, hash, screenshot, commit, or report the key;
- instruction: `docs/handoffs/0020-CODEX-16-direct-provider-control-qualification-instruction.md`;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- no Codex provider call is authorized until the local same-project key prerequisite is satisfied;
- no application source/deployment change, Web App query, existing Store mutation, OpenAI call, FULL_OUTPUT rerun, or main integration in CODEX-16;
- temporary synthetic Stores are permitted only inside the exact evidence matrix and must be deleted;
- only one active Codex dispatch may exist.

## CODEX-15 — RETURNED / BLOCKER

GitHub-accepted evidence:

- final returned branch head: `54ccb4a2f3d162927ac2a24df46ec829adc62b91`;
- implementation commit: `fe1f1c63aad2e84b98a43b7a7d130bff607229d7`;
- Apps Script version `54`; same private Web App updated in place;
- existing CODEX-14 opaque token was expired;
- one Generate Content + File Search query returned the safe service-unavailable category after `83364ms` with zero authoritative citations;
- focused tests `109/109` and repository checks `307/307` PASS as local/repository evidence;
- GitHub Actions workflow runs and commit status checks: `0`;
- no query retry, upload, reindex, lifecycle mutation, Store rebuild, key/model change, OpenAI call, FULL_OUTPUT rerun, or deployment expansion;
- metadata-filter, lifecycle, and Work-level final-integrity gates were not run;
- report: `docs/handoffs/0020-CODEX-15-gemini-provider-path-isolation-and-final-qualification-report.md`.

ChatGPT review correction:

- `83,364ms + service unavailable` does not identify whether the failure was an HTTP provider response, quota/project condition, transport termination, or another safe-wrapped error because no safe HTTP status/transport class was captured;
- CODEX-15 did not run a no-File-Search base-model control, so a provider incident is not yet proven;
- source/version `54` currently defaults to `GENERATE_CONTENT` even though that transport was attempted but not accepted. PR `#26` must remain Draft and unmerged until this is corrected by a later authorized dispatch.

## Earlier accepted evidence

- CODEX-14: low-thinking/bounded-output request profile, short START/POLL lifecycle, dedupe, reload resume, pending-state UX, and state integrity PASS; the same Interactions + File Search job remained pending for at least `600000ms`.
- CODEX-11: Gemini document reconciliation PASS; one Meeting query returned three authoritative citations; one synthetic TXT Pitchbook indexed.
- CODEX-03 and earlier accepted reports: schema `6`, exactly five Backend sheets, provider foundation, and FULL_OUTPUT PASS.
- CODEX-13 executed locally and returned long-running, but its unpushed commit is not GitHub-authoritative; CODEX-14 supersedes its useful behavior.

## Current Work classification

```text
SELECTED_GEMINI_QUERY_TRANSPORT: NONE QUALIFIED
PITCHBOOK_AUTHORITATIVE_CITATIONS: 0
GEMINI_RUNTIME: BLOCKED / DIRECT PROVIDER ISOLATION REQUIRED
STATE_INTEGRITY: PARTIAL — no mutation observed; CODEX-15 final readback was not run
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES
```

Current `main` has advanced independently. Integrate it only after the Gemini runtime blocker closes and before final merge.

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-16`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
