# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-03`
BALL: `CODEX`
STATUS: `ACTION_REQUIRED`
MODE: `BUILD / QUALIFICATION`

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:

`docs/handoffs/0020-CODEX-03-schema6-alignment-and-runtime-qualification-instruction.md`

## Primary outcome

Deliver one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

Source boundaries are fixed:

```text
ChatGPT / Gemini File Search
  → Meeting + Pitchbook/source materials

全文出力
  → authoritative Meeting Google Docs full text only
  → optional matching Pitchbook reference metadata + Drive links
```

## Accepted CODEX-02 evidence

- provider-neutral implementation present;
- `LOGIC_VALIDATION: PASS` — focused `50/50`, repository `254/254`, temporal/public-surface/diff checks PASS;
- public facade `28`;
- exact tested source synchronized/read back;
- immutable Apps Script version `41`;
- same private Web App updated in place;
- Backend and application data remained intact at exactly five sheets/schema `5`.

## Active completion blockers

1. configure and authorize at least one isolated File Search provider for live
   Meeting and Pitchbook retrieval/citation qualification.

CODEX-03 completed the three full-output corrections, schema-6 alignment,
FULL_OUTPUT target-runtime qualification, both disabled-provider/no-failover
checks, and final integrity. The detailed execution report is:

`docs/handoffs/0020-CODEX-03-schema6-alignment-and-runtime-qualification-report.md`

## Closed contracts

- Backend remains exactly five sheets;
- schema `6` appends only `AI_Provider_State_JSON` to Meeting_Index and Pitchbook_Index;
- legacy `AI_*` fields remain;
- OPENAI/GEMINI derived state is independent;
- OpenAI metadata remains within its current 16-attribute budget;
- stable IDs resolve citations back to authoritative Backend/Drive;
- no automatic provider failover or user-facing model selector;
- Pitchbook bodies are File Search inputs but never manual FULL_EXPORT body text;
- Copy/Docs/PDF share one exact Meeting package/fingerprint;
- no recurring trigger, confidential production data, production rollout, second Web App, or Library mutation.

## Completion

A deliberately disabled provider is acceptable only when its safe-error/no-failover path passes and at least one other File Search provider live-passes. FULL_OUTPUT must pass.

Current bounded result: FULL_OUTPUT and both disabled-provider safe-error paths
PASS, but neither provider is enabled/configured. Therefore the current Work
state is:

```text
ACTION_REQUIRED — AT_LEAST_ONE_FILE_SEARCH_PROVIDER_CONFIGURATION
READY: NO
BLOCKER: YES
```

Completion Latch applies only after ChatGPT final review and merge.
