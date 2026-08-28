# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
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

1. close three bounded full-output correctness findings:
   - visible preview must display the exact canonical package used by Copy/Docs/PDF;
   - zero matching Meetings must hard-stop FULL_EXPORT;
   - reference Pitchbooks must receive metadata/link identity validation without body/byte reads;
2. align the isolated synthetic Backend from schema `5` to `6` through the explicitly authorized bounded direct data-plane route when private setup is unavailable;
3. qualify FULL_OUTPUT in target runtime;
4. live-qualify every enabled File Search provider and prove safe errors/no failover for disabled providers;
5. complete final integrity.

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

Completion Latch applies only after ChatGPT final review and merge.
