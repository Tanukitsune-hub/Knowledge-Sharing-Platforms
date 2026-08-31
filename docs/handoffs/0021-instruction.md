# Work 0021 — Structured Knowledge Search

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
MODE: `BUILD / QUALIFICATION -> FINAL WORK READINESS`

Active instruction:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-instruction.md`

Current operational state and browser diagnostic:

- `docs/handoffs/0021-dispatches.md`
- `docs/handoffs/0021-CODEX-04-browser-upload-diagnostic-note.md`

Accepted reports:

- `docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-report.md`;
- `docs/handoffs/0021-CODEX-02-openai-filter-metadata-reconciliation-and-core-runtime-qualification-report.md`;
- `docs/handoffs/0021-CODEX-03-multi-entity-comparison-and-advanced-exact-filters-report.md`.

Canonical delivery order:

`docs/planning/work-registry.md`

Detailed Work plan:

`docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted dependencies and Work 0021 state

Work 0020 and Work 0025 are accepted/merged and are not reopened.

Work 0021 is accepted through CODEX-03:

- canonical structured filters and five modes;
- OpenAI/FULL_OUTPUT shared request contract;
- exact provider metadata reconciliation;
- explicit 2–5 Entity comparison;
- per-Entity citation/evidence attribution;
- exact Related GP / Meeting Type filters;
- FULL_OUTPUT multi-Entity parity;
- private Web App version 63;
- canonical `368/368` PASS and Apps Script readback `80/80` PASS.

## CODEX-04 resume condition

Local deterministic validation reached `371/371` PASS, but runtime qualification has not started because the browser-assisted local-file upload bridge was unavailable before any fixture registration/provider mutation.

The user confirmed the Chrome extension setting `Allow access to file URLs / ファイルのURLへのアクセスを許可する` is already ON. Read-only diagnosis then proved the task is attached to the enabled Chrome extension in Profile 2, all six workspace-local fixture copies are readable, and the failure occurs before file assignment because the native chooser never opens.

Resume the SAME `0021-CODEX-04` dispatch and first diagnose the actual browser/profile/session/local-file path using the committed diagnostic note. Do not ask the user to repeat the already-enabled toggle without fresh evidence.

Current safe state:

```text
TARGET_RUNTIME_QUALIFICATION: BLOCKED / NOT RUN
PRIVATE_WEB_APP_VERSION: 63 / UNCHANGED
RUNTIME_MUTATION: NONE
PROVIDER_MUTATION: NONE
NEW_FORMAT_FIXTURES_REGISTERED: 0
DIAGNOSTIC: COMPLETE
BLOCKER: BROWSER_EXTENSION_FILE_CHOOSER_BRIDGE_UNAVAILABLE_PROFILE_2
```

Fully exit Chrome and reopen Profile 2 to reload the extension/permission process, then resume this same CODEX-04. If the same fresh-process failure persists, reinstall the Browser plugin from the ChatGPT plugin UI. Do not repeat the toggle and do not create CODEX-05.

## CODEX-04 outcome after diagnosis

Complete only the bounded six-format/provider-capability matrix for:

```text
pdf / pptx / xlsx / docx / txt / eml
```

The source adapters/format registry already exist. Connect/fix only proven defects, qualify the enabled OpenAI route with authoritative citations, preserve EML attachment exclusion, verify FULL_OUTPUT reference-only parity, and record Gemini as disabled/deferred without an API call.

Current DEV Pitchbook inventory does not contain a small complete six-format matrix. CODEX-04 may create at most six tiny non-confidential synthetic Pitchbooks through the normal registration flow. Never use `DOC-000018` or the old 5–25 MiB fixtures.

This is the final planned Work 0021 dispatch. If required gates pass, stop and return PR #34 for ChatGPT final review/merge.

Keep PR #34 Draft/Open/unmerged. Do not merge it.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
