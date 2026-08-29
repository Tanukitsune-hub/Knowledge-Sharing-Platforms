# Work 0020 dispatch control

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-17`
BALL: `USER`
STATUS: `ACTION_REQUIRED`

## Active dispatch

### 0020-CODEX-17 — ACTION_REQUIRED

- mode: `INVESTIGATION -> BUILD / QUALIFICATION`;
- route: `C` after the OpenAI secret prerequisite is satisfied;
- purpose: qualify OpenAI Responses API + File Search as the primary usable Knowledge Search provider, then finish metadata/lifecycle/final-integrity gates;
- user decision: Google AI Studio is also showing repeated errors, so stop spending the active completion path on Gemini diagnosis and try OpenAI API;
- current OpenAI implementation already contains Responses API, Files, Vector Store, attributes, File Search filters, indexing/readback, cleanup, and provider-neutral hooks;
- authoritative decision: `docs/decisions/openai-zero-friction-onboarding-and-project-switch.md`;
- instruction: `docs/handoffs/0020-CODEX-17-openai-file-search-primary-qualification-instruction.md`;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- prerequisite: an OpenAI project API key must be available only to the local Codex process as `OPENAI_API_KEY`;
- never paste, print, log, screenshot, hash, commit, audit, or report the key;
- first action after prerequisite: direct OpenAI base-model + temporary synthetic File Search control outside Apps Script;
- only after direct provider PASS may Codex implement the private-Web-App synthetic connection test and bounded OpenAI activation flow;
- default Work model: `gpt-5.6-terra`; no silent more-expensive model switch;
- no automatic provider failover;
- no confidential/live data in qualification;
- no Gemini live calls, FULL_OUTPUT rerun, new Web App/Library/public debug endpoint, or current-main integration in this bounded dispatch.

## Superseded dispatch

### 0020-CODEX-16 — SUPERSEDED / NOT EXECUTED

- CODEX-16 was prepared for direct Gemini same-project controls;
- before execution, the user chose OpenAI API as the active completion strategy because Google AI Studio itself was also repeatedly erroring;
- preserve the CODEX-16 handoff for history only; do not execute it unless a later Gemini-recovery Work explicitly reopens it.

## Accepted Gemini evidence retained

- CODEX-14 application request/lifecycle/UX work PASS; one Interactions + File Search job stayed pending for at least `600000ms`;
- CODEX-15 Generate Content + File Search returned a safe failure after `83364ms` with zero citations;
- Gemini document reconciliation and one earlier grounded Meeting query remain accepted evidence;
- current pushed Gemini source is not user-ready and must not be merged as a qualified default.

## Current Work classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI — qualification pending
OPENAI_RUNTIME: NOT YET LIVE-QUALIFIED
GEMINI_RUNTIME: BLOCKED / PROVIDER PATH DEFERRED
PITCHBOOK_AUTHORITATIVE_CITATIONS: 0 on current Gemini path
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES
```

Only one active Codex dispatch may exist.

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-17`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
