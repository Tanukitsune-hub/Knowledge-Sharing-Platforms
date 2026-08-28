# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Active dispatch

### 0020-CODEX-04 — RETURNED / BLOCKER

- mode: `BUILD / QUALIFICATION`;
- route: `C`;
- purpose: configure and live-qualify Gemini File Search only, while deliberately leaving OpenAI disabled;
- recommended model: `Luna Max` — architecture and acceptance boundary are settled; remaining work is bounded provider setup/runtime qualification;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-04-gemini-only-provider-qualification-instruction.md`;
- user secret-entry boundary: Gemini API key is entered directly by the user into Apps Script Script Properties as `KSP_GEMINI_API_KEY`; never copy it into chat/GitHub/report;
- OpenAI: deliberately deferred; keep disabled and do not request/create/configure an OpenAI key.
- deterministic gates and first-run Store creation: PASS;
- first synthetic Meeting-grounded Gemini retrieval: FAIL — Web App returned `検索サービスを利用できません。` without an answer/citation;
- Pitchbook retrieval and remaining provider lifecycle checks: NOT RUN under the bounded stop rule;
- report: `docs/handoffs/0020-CODEX-04-gemini-only-provider-qualification-report.md`;
- current ball: `CHATGPT`; blocker requires a new bounded decision before further live attempts.

## Accepted dispatch

### 0020-CODEX-03 — ACCEPTED / COMPLETE

Accepted evidence is closed absent material contradiction:

- focused validation `52/52 PASS`;
- repository validation `256/256 PASS`;
- temporal/public-surface/diff checks PASS;
- public facade `28`;
- Backend exactly five sheets/schema `6`;
- installation state schema `6` readback PASS;
- exact source sync/readback and private Web App version `42`;
- FULL_OUTPUT runtime PASS;
- Preview/Docs/PDF package parity PASS;
- Pitchbook reference-only FULL_OUTPUT boundary PASS;
- OpenAI/Gemini disabled safe-error and zero-failover checks PASS;
- final integrity PASS; Audit `69`, triggers `0`, deployment count `9`, Library/permissions unchanged.

CODEX-03 stopped only because no File Search provider was enabled/configured. The user has now selected Gemini as the provider to qualify and explicitly deferred OpenAI.

## Earlier dispatches

- `0020-CODEX-02`: returned; implementation accepted, runtime blocked before schema alignment.
- `0020-CODEX-01`: superseded before qualification because its Pitchbook-full-output requirement was replaced.

## Closed source scopes

```text
Gemini File Search -> Meeting + Pitchbook/source materials
ChatGPT/OpenAI -> provider remains visible but disabled for now
全文出力 -> Meeting Google Docs full text + optional Pitchbook references/links
```

Only one active Codex dispatch may exist.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
