# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-01`
BALL: `CODEX`
STATUS: `READY`
MODE: `BUILD / QUALIFICATION`

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

## Primary outcome

Deliver one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

ChatGPT and Gemini use File Search. 全文出力 calls no AI API and emits one canonical full-text package used identically by Copy / Google Docs / PDF.

## Fixed contracts

- accepted baseline: Work 0019 merged; private Web App version `40`; Backend exactly five sheets/schema `5`; public facade `28`;
- Work 0020 increments schema exactly once to `6`;
- append `AI_Provider_State_JSON` to Meeting_Index and Pitchbook_Index only;
- preserve legacy `AI_*` fields;
- OpenAI/Gemini derived state is independent;
- OpenAI provider metadata respects the current 16-attribute file limit and uses a compact stable-ID-first projection;
- display names/Drive URLs resolve from authoritative Backend by stable source ID rather than consuming provider metadata slots;
- no automatic provider failover;
- provider model selection remains admin-side;
- FULL_EXPORT means actual readable full text for every source claimed included; metadata/link-only Pitchbook handoff may not be labeled 全文出力;
- unsupported full-output format fails clearly rather than silently producing a partial package;
- no recurring trigger;
- no confidential/company production data;
- no production rollout.

## Acceptance evidence — strongest first

1. enabled File Search provider: actual Store/index/query/citation path maps back to exact stable source ID and authoritative Drive link;
2. same provider proves update -> reindex, Inactive exclusion, Reactivate restoration, exact delete/rebuild, and no duplicate active document;
3. FULL_EXPORT proves actual Meeting + fully extractable Pitchbook/source body, Copy/Docs/PDF exact package/fingerprint parity, and no AI provider call;
4. selected disabled provider proves provider-specific safe error and zero cross-provider failover;
5. schema 6/provider-state migration is append-only/idempotent and legacy state remains preserved;
6. secrets/questions/answers/chunks/source bodies/raw provider payloads/private Store IDs are absent from Audit/browser/GitHub/reports;
7. final integrity: five Backend sheets/schema 6, authoritative rows/files stable except explicitly bounded synthetic lifecycle, no recurring trigger, no unauthorized permission/Library/deployment mutation.

## Completion

Only BLOCKER stops completion. A provider deliberately disabled by configuration is not a blocker if its safe-error/no-failover path passes and at least one File Search provider live-passes. FULL_OUTPUT must pass.

Completion Latch after ChatGPT final review/merge only.
