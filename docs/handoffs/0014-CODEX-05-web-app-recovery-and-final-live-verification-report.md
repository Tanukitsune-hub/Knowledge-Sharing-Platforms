# Work 0014 — CODEX-05 Web App recovery and final live verification report

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-05`
BALL: `CHATGPT`
STATUS: `BLOCKED`

Execution date: `2026-08-27`

Instruction ref: `48e255919c379433c057ab20eae4a4add104f551`

## Result

`NOT QUALIFIED — PITCHBOOK POST-SAVE SEARCH FAILED`

`BLOCKER: YES`

## Deployment recovery

`PASS`

- Confirmed the identity-accepted synthetic DEV Apps Script project and single authenticated account context.
- Confirmed the saved remote deployable source still matched the accepted tested source: `59/59 PASS`.
- Confirmed immutable Apps Script version `28` was the latest version before mutation.
- Classified deployment entrypoints in the Apps Script editor before mutation. No existing deployment was updated, archived, deleted, or repurposed.
- Created exactly one new deployment through the editor with type `Web app`, execute as deploying user, and access `Only myself`.
- Apps Script created exactly one automatic immutable version, `29`.
- Readback confirmed one CODEX-05 Web App entrypoint and one normal `/exec` endpoint. CLI inventory increased from eight to nine entries including HEAD; existing deployment descriptions remained present.
- No second deployment was created.

No deployment ID, private URL, account identifier, or resource ID is recorded.

## Main-page gate

`PASS`

The newly generated `/exec` was opened exactly once. The normal Knowledge Sharing Platforms main page rendered with the expected application navigation and no page-not-found, Library, Drive-open, or fatal application error.

## Pitchbook Fund / Strategy verification

- pre-save prior value absent: `PASS`;
- one non-empty synthetic Fund / Strategy value entered: `PASS`;
- save attempt: `PASS — executed exactly once`;
- application success response: `PASS — 更新しました。`;
- authoritative Backend readback: `PASS — exactly one target row contains the new value`;
- immutable identity preservation: `PASS — Document_ID, File_ID, Sequence_No, saved filename, and Active status remained unchanged`;
- Audit: `PASS — exactly one successful metadata-level PITCHBOOK_UPDATE event was appended`;
- duplicate/partial row mutation: `PASS — Pitchbook row count remained unchanged and the target row remained unique`;
- post-save search: `FAIL`;
- reopen/round-trip UI verification: `NOT RUN — the target was absent from the one authorized post-save search result`.

Smallest decisive evidence: before saving, the exact Date/GP/Asset Class/Equity/Active filter set returned the one target synthetic Pitchbook. After the successful one-time save, the same retained filter values returned zero rows. Backend readback still showed one Active target row with the same logical date and stable identity fields.

No second search, save retry, deployment, or source hypothesis was attempted.

## Final authoritative integrity

`NOT RUN — stopped at the first post-save application/search failure as required`

The bounded immediate readback above confirmed the target row and Audit mutation only. The broader final integrity matrix was not executed, and accepted Meeting, relationship, Knowledge Export, Shared Drive, and Gemini evidence was not reopened.

## Classification

Work 0014: `NOT QUALIFIED — PITCHBOOK POST-SAVE SEARCH FAILED`.

`BLOCKER: YES`

PR #17 remains Draft / Open / unmerged for ChatGPT review.
