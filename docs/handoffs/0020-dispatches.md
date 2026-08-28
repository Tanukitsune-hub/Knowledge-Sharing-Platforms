# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-01`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-01 — READY

- mode: `BUILD / QUALIFICATION`;
- route: `C`;
- purpose: provider-neutral core + OpenAI/Gemini File Search adapters + truthful full-output route + first live qualification;
- recommended model: `Sol High` — current provider APIs, cross-provider state migration, metadata limits, citation mapping, and live runtime behavior remain materially runtime-dependent;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-01-ai-provider-core-instruction.md`.

## Accepted baseline

- Work 0019 accepted/merged;
- main baseline: `bc7c6efda63b13e8a998e32d97028ee3a3557e3b`;
- private Web App version `40`;
- exactly five Backend sheets / schema `5`;
- public facade `28`;
- Audit `64` at Work 0019 completion;
- AI sync disabled and triggers `0` at Work 0019 completion;
- provider selection decision: `ChatGPT / Gemini / 全文出力`, no automatic failover.

Only one Codex dispatch may be active.

Exact execution ref is supplied in the ChatGPT dispatch prompt after this activation commit. Codex must not execute from an older ref.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-01`
BALL: `CODEX`
STATUS: `READY`
