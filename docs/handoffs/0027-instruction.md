# Work 0027 instruction

WORK_ID: `0027`  
DISPATCH_ID: `0027-CODEX-01`  
BALL: `CODEX`  
STATUS: `READY`  
MODE: `BUILD`

## Primary outcome

Repair Gemini's production-relevant transient handling and complete one synthetic File Search end-to-end qualification without reopening accepted Work 0026 or disturbing OpenAI/FULL_OUTPUT.

## Sources of truth

- `AGENTS.md`
- nearest `src/AGENTS.md`
- `docs/handoffs/0027-company-gas-gemini-smoke-evidence.md`
- `docs/decisions/gemini-gas-runtime-evidence-and-transient-resilience.md`
- `docs/planning/work0027-gemini-file-search-resilience-and-qualification.md`
- `docs/handoffs/0027-dispatches.md`
- detailed CODEX-01 instruction
- current GitHub main/branch/PR state

## Closed conclusions

- company GAS can reach Gemini;
- the tested key and basic authentication work;
- `gemini-3.8-flash` is visible and Interactions works;
- observed GenerateContent 503 is transient provider capacity evidence;
- File Search Store create/delete works;
- the independent upload failure was caused by the diagnostic's ordinary `Content-Length` header;
- current main does not set ordinary `Content-Length` and must preserve the required `X-Goog-Upload-Header-Content-Length`;
- File Search upload/index/query/citation remains unqualified.

## Completion condition

Return only after the detailed instruction's deterministic gates, exact deployment boundary, bounded synthetic runtime campaign, cleanup, report, dispatch ledger, Work report, planning, runtime locator, PR, and final commit are complete.

Do not enable Gemini for normal users merely because the isolated qualification passes. Return `QUALIFIED_DISABLED` for ChatGPT review.
