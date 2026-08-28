# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Accepted state before CODEX-04

```text
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — not configured
GEMINI_RUNTIME: SAFE_DISABLED_ERROR — not configured
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: NO
BLOCKER: YES — no File Search provider live-qualified yet
```

CODEX-03 accepted evidence:

- focused `52/52 PASS`;
- repository `256/256 PASS`;
- temporal/public-surface/diff checks PASS;
- public facade `28`;
- Backend exactly five sheets/schema `6`;
- installation state schema `6`;
- Apps Script version `42` on the same private Web App;
- FULL_OUTPUT Preview/Docs/PDF PASS;
- canonical package parity PASS;
- disabled-provider safe errors/no-failover PASS;
- final integrity PASS; Audit `69`, triggers `0`, deployment count `9`, Library/permissions unchanged.

Detailed accepted report:

`docs/handoffs/0020-CODEX-03-schema6-alignment-and-runtime-qualification-report.md`

## User provider decision

The user has selected Gemini for the first live File Search qualification and explicitly deferred OpenAI.

```text
OpenAI / ChatGPT
  -> keep disabled/unconfigured
  -> existing SAFE_DISABLED_ERROR / no-failover evidence remains accepted

Gemini
  -> configure now
  -> live-qualify Meeting + Pitchbook indexing/retrieval/citation lifecycle

全文出力
  -> CODEX-03 PASS remains accepted
```

OpenAI live qualification is therefore not an active Work 0020 blocker.

## Active CODEX-04 scope

`docs/handoffs/0020-CODEX-04-gemini-only-provider-qualification-instruction.md`

CODEX-04 must:

- preserve all CODEX-03 accepted evidence;
- fix the first-time Gemini Store creation path if the current early configuration gate still blocks a blank Store;
- keep generation model and embedding model separate (`gemini-3.7-flash` vs `models/gemini-embedding-2`);
- have the user enter `KSP_GEMINI_API_KEY` directly in Apps Script Script Properties without exposing the secret;
- create/reuse one isolated Gemini File Search Store;
- index/retrieve/cite at least one Meeting and one Pitchbook/source;
- prove metadata filter, update/reindex, Inactive, Reactivate, delete/rebuild, no duplicate active documents;
- restore `AI_SYNC_ENABLED=false` and keep triggers `0` at completion;
- keep OpenAI disabled and untouched.

## CODEX-04 return

Deterministic implementation and validation passed, including the dormant future OpenAI administrator activation path:

- focused provider/admin/public-surface tests `17/17 PASS`;
- repository validation `265/265 PASS`;
- temporal validation and `git diff --check` PASS;
- public facade `30`, including the two intentional administrator-surface calls;
- exact source synchronization/readback and one in-place private Web App update completed;
- Gemini was displayed as configured and one isolated Store was created once;
- OpenAI remained disabled/unconfigured and was not called.

The first synthetic Meeting-grounded Gemini search returned the safe Web App error `検索サービスを利用できません。` without an answer or citation. Per the handoff stop rule, no Pitchbook search, lifecycle mutation, retry, or post-failure final integrity qualification was performed.

```text
GEMINI_RUNTIME: FAIL — first Meeting retrieval unavailable
READY: NO
BLOCKER: YES
```

Detailed report:

`docs/handoffs/0020-CODEX-04-gemini-only-provider-qualification-report.md`

Expected final matrix after the bounded Gemini failure is resolved:

```text
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```
