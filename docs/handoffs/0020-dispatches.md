# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-02 — READY

- mode: `BUILD / QUALIFICATION`;
- route: `C`;
- purpose: provider-neutral core + dual File Search over Meeting/Pitchbook + Meeting-only FULL_EXPORT + first live qualification;
- recommended model: `Sol High` — current provider APIs, cross-provider state migration, metadata limits, citation mapping, and live runtime behavior remain materially runtime-dependent;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-02-meeting-full-output-file-search-scope-instruction.md`;
- exact execution ref: use the final PR #26 head supplied in the ChatGPT dispatch prompt. Do not execute from CODEX-01 or an older branch ref.

## Superseded dispatch

### 0020-CODEX-01 — SUPERSEDED

CODEX-01 was prepared with an incorrect FULL_EXPORT requirement that attempted to include Pitchbook body text. The user reconfirmed the original product boundary before acceptance:

```text
ChatGPT / Gemini File Search -> Meeting + Pitchbook/source materials
全文出力 -> Meeting Google Docs full text only + optional Pitchbook references/links
```

CODEX-01 must not be used as the current execution contract. No evidence from it is accepted because the dispatch had not returned a qualification result.

## Accepted baseline

- Work 0019 accepted/merged;
- main baseline: `bc7c6efda63b13e8a998e32d97028ee3a3557e3b`;
- private Web App version `40`;
- exactly five Backend sheets / schema `5`;
- public facade `28`;
- Audit `64` at Work 0019 completion;
- AI sync disabled and triggers `0` at Work 0019 completion;
- provider selection: `ChatGPT / Gemini / 全文出力`, no automatic failover;
- File Search source scope: Meeting + Pitchbook/source materials;
- FULL_EXPORT body scope: Meeting Google Docs only.

Only one Codex dispatch may be active.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
