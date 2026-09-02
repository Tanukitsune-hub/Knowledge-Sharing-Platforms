# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Active dispatch

### 0021-CODEX-04 — RETURNED / FULL_OUTPUT DRIVE-LINK INTEGRITY BLOCKER

Human-assisted normal registration succeeded for all six tiny synthetic fixtures. Chrome chooser automation is `FIX SOON / external tooling`, not a product blocker.

Current evidence:

```text
LOGIC_VALIDATION: PASS — 373/373
PRIVATE_WEB_APP_VERSION: 65
NORMAL_REGISTRATION: PASS — 6/6
OPENAI_EXACT_SYNC: PASS — 6/6 matrix sources
OPENAI_GROUNDED_QUERY_AND_SOURCE_ID: PASS — 6/6
EML_ATTACHMENT_BOUNDARY: PASS
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: FAIL — DOC-000022 authoritative Drive link unavailable
TARGET_RUNTIME_QUALIFICATION: FAIL / PARTIAL
BLOCKER: FULL_OUTPUT_AUTHORITATIVE_DRIVE_LINK_UNAVAILABLE_DOC_000022
PR_34: Draft / Open / unmerged
```

Authorization:

`docs/handoffs/0021-CODEX-04-additional-bounded-deployment-authorization.md`

The additional immutable version/update authorization was used exactly once. Source readback passed `80/80`; version 65 qualified XLSX indexing and six-format OpenAI retrieval. The final FULL_OUTPUT preview then failed closed on the authoritative Drive link for `DOC-000022`, so the Dispatch stopped without version 66 or further runtime mutation.

ChatGPT now owns review and the next bounded decision. Do not automatically create CODEX-05 or repeat registration/sync/query.

## Accepted prior dispatches

- CODEX-01: core structured filters and five modes implemented.
- CODEX-02: metadata reconciliation, all five modes, FULL_OUTPUT parity, Gemini-disabled no-failover qualified.
- CODEX-03: 2–5 Entity comparison, per-Entity citation attribution, Related GP / Meeting Type exact filters and FULL_OUTPUT parity qualified.

## Prohibited actions

No repeat registration, broad sync/reindex, Gemini call, provider fallback, `DOC-000018`, old large fixtures, chooser repair, Work 0023, new Web App/Vector Store/endpoint, rebase, force-push, or PR merge.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`
