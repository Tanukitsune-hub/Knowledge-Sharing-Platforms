# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-02`
BALL: `CODEX`
STATUS: `BLOCKED`
MODE: `BUILD / QUALIFICATION`

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active Codex instruction: `docs/handoffs/0020-CODEX-02-meeting-full-output-file-search-scope-instruction.md`

## Primary outcome

Deliver one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

The source boundaries are fixed:

```text
ChatGPT / Gemini File Search
  -> Meeting + Pitchbook/source materials

全文出力
  -> Meeting Google Docs full text only
  -> optional matching Pitchbook reference list + authoritative Drive links
```

ChatGPT and Gemini both use File Search. FULL_EXPORT calls no AI API.

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
- File Search must directly prove both Meeting and Pitchbook/source indexing, retrieval, and citation;
- FULL_EXPORT body consists only of authoritative Meeting Google Docs text;
- matching Pitchbooks may be reference metadata + Drive links only; their body/file bytes are not read for FULL_EXPORT;
- Copy / Google Docs / PDF use one identical canonical Meeting package/fingerprint;
- buttons above body; bottom fixed-height internally scrollable Meeting preview;
- no recurring trigger;
- no confidential/company production data;
- no production rollout.

## Acceptance evidence — strongest first

1. enabled File Search provider: actual Store/index/query/citation path proves both one Meeting and one Pitchbook/source map back to exact stable source IDs and authoritative Drive links;
2. same provider proves update -> reindex, Inactive exclusion, Reactivate restoration, exact delete/rebuild, and no duplicate active document;
3. FULL_EXPORT proves authoritative Meeting Google Docs full text, Copy/Docs/PDF exact package/fingerprint parity, Pitchbook reference-only behavior, and zero AI provider call;
4. selected disabled provider proves provider-specific safe error and zero cross-provider failover;
5. schema 6/provider-state migration is append-only/idempotent and legacy state remains preserved;
6. secrets/questions/answers/chunks/source bodies/raw provider payloads/private Store IDs are absent from Audit/browser/GitHub/reports;
7. final integrity: five Backend sheets/schema 6, authoritative rows/files stable except explicitly bounded synthetic lifecycle, no recurring trigger, no unauthorized permission/Library/deployment mutation.

## Closed conclusions

- Pitchbooks are first-class File Search sources for ChatGPT and Gemini.
- Pitchbook body extraction is **not** part of the manual FULL_EXPORT route.
- Work 0021 six-format qualification applies to provider File Search, not Pitchbook full-output extraction.
- `全文出力` remains the user-facing label, with helper text clarifying that it outputs Meeting Google Docs and shows matching Pitchbooks only as references.
- CODEX-01 is superseded and must not be used.

## Completion

Only BLOCKER stops completion. A provider deliberately disabled by configuration is not a blocker if its safe-error/no-failover path passes and at least one File Search provider live-passes. FULL_OUTPUT must pass.

Completion Latch after ChatGPT final review/merge only.

## CODEX-02 execution state

The implementation and deterministic validation passed, and the exact tested
source was synchronized once and deployed in place as immutable version `41`.
Target Backend readback remains schema `5`; the required canonical private
`setupKnowledgePlatform_()` execution surface was unavailable (the editor
selector excludes the private function and bounded `clasp run` attempts
returned a permission error). No direct Backend or Script Property workaround
was used. Target-runtime provider, FULL_EXPORT, and final-integrity checks are
`NOT RUN`; the active blocker is the unavailable private administrator route.
