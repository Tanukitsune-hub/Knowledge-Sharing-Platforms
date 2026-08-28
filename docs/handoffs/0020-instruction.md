# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `BUILD / QUALIFICATION`

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:

`docs/handoffs/0020-CODEX-04-gemini-only-provider-qualification-instruction.md`

## Primary outcome

Deliver one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

The user has chosen Gemini as the File Search provider to configure and live-qualify now. OpenAI is deliberately deferred and remains disabled.

Source boundaries remain fixed:

```text
Gemini File Search
  -> Meeting + Pitchbook/source materials

ChatGPT / OpenAI
  -> visible provider route but disabled for now

全文出力
  -> authoritative Meeting Google Docs full text only
  -> optional matching Pitchbook reference metadata + Drive links
```

## Accepted CODEX-03 evidence

Closed absent material contradiction:

- `52/52` focused PASS;
- `256/256` repository PASS;
- temporal/public-surface/diff checks PASS;
- public facade `28`;
- Backend exactly five sheets/schema `6`;
- installation state schema `6` PASS;
- exact source sync/readback and Apps Script version `42`;
- same private Web App, deployment count `9`;
- FULL_OUTPUT runtime PASS;
- Preview/Docs/PDF exact package parity PASS;
- Pitchbook reference-only FULL_OUTPUT behavior PASS;
- both disabled-provider safe errors and zero failover PASS;
- final integrity PASS, Audit `69`, triggers `0`, Library/permissions unchanged.

Do not rerun CODEX-03 matrices unless a material contradiction appears.

## Active blocker

Only Gemini live File Search qualification remains.

The user owns a Gemini API key and will enter it directly into the Apps Script Script Properties surface under:

```text
KSP_GEMINI_API_KEY
```

Never request the raw key in chat, GitHub, report text, or a normal Sheet.

## Provider completion boundary

Work 0020 may complete with:

```text
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
```

OpenAI live qualification is not a Work 0020 blocker after this explicit user decision.

## Closed contracts

- Backend remains exactly five sheets/schema `6`;
- legacy `AI_*` fields remain;
- OpenAI/Gemini derived state is independent;
- stable IDs resolve citations back to authoritative Backend/Drive;
- no automatic provider failover;
- Pitchbook bodies are File Search inputs but never manual FULL_EXPORT body text;
- Copy/Docs/PDF share one exact Meeting package/fingerprint;
- no recurring trigger, confidential production data, production rollout, second Web App, or Library mutation.

## Completion

On Gemini live PASS and final integrity PASS:

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES for personal-PC provider core
BLOCKER: NO
```

Completion Latch applies only after ChatGPT final review and merge.

## Current CODEX-04 return

The deterministic gates and the bounded first-run Gemini Store setup passed. The first synthetic Meeting-grounded Gemini retrieval returned `検索サービスを利用できません。` with no answer/citation. The handoff stop rule was applied: Pitchbook retrieval, provider lifecycle checks, and post-failure final integrity were not run; no retry or second production hypothesis was opened.

Current state:

```text
GEMINI_RUNTIME: FAIL — first Meeting retrieval unavailable
READY: NO
BLOCKER: YES
```

Future OpenAI activation is implemented for a later, deliberate enablement: save `KSP_OPENAI_API_KEY` in Script Properties, then use the administrator-only `OpenAIを有効化` action; no additional coding is intended. OpenAI was not enabled or called in this run.
