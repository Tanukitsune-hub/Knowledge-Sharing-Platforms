# Work 0027 instruction

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-05
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Primary outcome

Make personal-DEV Gemini File Search return an answer with an authoritative current source citation before company qualification. Model novelty is not required. Gemini remains disabled/hidden until controller review.

## Current execution contract

`docs/handoffs/0027-CODEX-05-strict-citation-resolver-instruction.md`

Current ball: `docs/handoffs/0027-dispatches.md`.
Current result: `docs/handoffs/0027-report.md`.

CODEX-05 returned `QUALIFIED_DISABLED`: implementation and target-runtime qualification passed at version 73, cleanup was confirmed, and Gemini remains disabled/hidden. The consumed execution details are recorded in `docs/handoffs/0027-CODEX-05-strict-citation-resolver-report.md`; no authorization in this instruction remains reusable.

Read applicable AGENTS and deployment policy. CODEX-05 replaces expired CODEX-04 authority; no old unused budget carries over.

## Closed evidence

Work 0026 safety, CODEX-01 retry/upload recovery, accepted OpenAI/FULL_OUTPUT and installer boundaries remain preserved. CODEX-02 returned a 3.7 answer and citation but failed identity matching; its 440/440 tests, 82/82 readback and version-72 shell are historical evidence, not post-repair validation.

CODEX-04 final `18226013d6f98a5cb2bffdf72ced52e766a8b698` recovered the exact stored response. source is content text, document_uri is the requested Store, and source_type/source_id/content_hash are in object custom_metadata. The existing source-equals-Document-name predicate rejects that shape. The old upload/readback Document name remains UNAVAILABLE and must not be reconstructed.

The CODEX-04 fixture/report are sufficient to start implementation. Do not repeat diagnosis, switch models or hash returned excerpts as a replacement for authoritative identity. Its historical Free-tier quota snapshot does not prove the earlier 429 cause or future headroom.

## Decided repair

Preserve document_uri as a separate scope field. Resolve Store + exact metadata through one current Active provider document and the authorized authoritative source/current Gemini hash. Use one shared strict resolver in qualification and normal immediate/polled search. Validate before deduplicating; equivalent repeated annotations may collapse, conflicting identities must not disappear. Keep output links authoritative and OpenAI mapping unchanged.

Implement and test first. Then, with a fresh same-project quota check and the existing guarded Web App administrator route, perform one synthetic 3.7/low/2048 confirmation. Use no Models/short generation/other model/transport probe. One Store/TXT; finally cleanup and confirmation; one source delivery, at most version 73 and same-private-Web-App update. No handler monkey-patch or authorization bypass.

## Completion

Only correctly bound live QUALIFIED_DISABLED with shared mapping parity, source/runtime evidence, cleanup and required tests satisfies acceptance. An implementation blocked by runtime quota remains delivered but not qualified; report the precise pending gate. Keep PR #37 Draft/Open/unmerged. Do not activate Gemini or merge.

```text
CODEX_05_IMPLEMENTATION: PASS
CODEX_05_LOGIC_VALIDATION: PASS / 448 of 448
CODEX_05_TARGET_RUNTIME_QUALIFICATION: PASS
CODEX_05_TERMINAL_OUTCOME: QUALIFIED_DISABLED
CODEX_05_CLEANUP: PASS
WORK_ACCEPTANCE: MET
GEMINI: disabled / hidden
READY: YES / ChatGPT final review
BLOCKER: NONE
```

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-05
BALL: CHATGPT
STATUS: RETURNED
