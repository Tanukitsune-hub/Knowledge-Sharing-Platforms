# Work 0014 — Structured meeting context foundation

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-01`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Mode: `BUILD`

Primary design:

`docs/planning/work0014-structured-meeting-context.md`

Active execution instruction:

`docs/handoffs/0014-CODEX-01-structured-meeting-context-implementation-instruction.md`

## Primary outcome

Add structured Meeting/Pitchbook context required by later GP summary and analytics features while preserving legacy data and the five-sheet backend architecture.

Required product surface:

- optional Team attribution using Option Master;
- optional Fund / Strategy on Meeting and Pitchbook;
- three Meeting type checkboxes;
- Meeting ↔ Pitchbook stable-ID association;
- follow-up flag and note;
- create/edit/search/export round-trip and migration compatibility.

## Closed design conclusions

Do not reopen without material contradiction:

- keep the existing five Backend sheets;
- Team is an Option Master type, seeded PD / AE, optional for legacy and new Meeting records;
- Fund / Strategy is optional free text, not a new master;
- Meeting types use stable codes in one canonical comma-separated column;
- Meeting↔Pitchbook relationships are stored in Meeting_Index by immutable Document IDs, not Drive URLs or a relation sheet;
- Follow-up is a flag plus optional note, not a workflow engine;
- GP one-page, analytics, admin monthly checks, and legacy converter are follow-on Works;
- Shared Drive-specific and billing-enabled Gemini live qualification are outside Work 0014.

## Production storage boundary inherited by Work 0014

The accepted production storage decision is authoritative:

`docs/decisions/shared-drive-production-root.md`

Work 0014 must preserve this boundary even though Shared Drive-specific live qualification is out of scope:

- production does not use or transit through My Drive;
- `knowledgeParentFolderId` points to a selected folder inside the organization-controlled Shared Drive;
- the application creates/reuses `Private Assets Knowledge` beneath that selected folder;
- `Meeting Records` and `Pitchbooks` remain authoritative beneath `Private Assets Knowledge`;
- no new code may introduce a production My Drive fallback or staging path;
- real Drive/folder IDs and URLs must not be committed.

## Acceptance evidence

- append-only idempotent schema/setup migration;
- legacy Meeting/Pitchbook compatibility;
- Team seed/maintenance behavior;
- new Meeting fields survive create/edit/search/draft/retry paths;
- Pitchbook Fund / Strategy survives prepare/upload/retry/edit/search;
- stable relationship behavior, including preservation of existing links after linked Pitchbook inactivation;
- Past Records filters work;
- Knowledge Export metadata includes the new structured context while Audit remains content-redacted;
- deterministic full checks PASS;
- synthetic DEV live smoke PASS with no authoritative corruption.

## Non-goals

No new backend sheet, Fund master, dashboard, chart, reminder, production rollout, Shared Drive qualification, Gemini billing qualification, or broad refactor.

## Completion

Work 0014 is complete only when the new structured fields work end-to-end in synthetic DEV, existing legacy records remain usable, deterministic checks pass, no blocker remains, reports are current, and the PR is ready for ChatGPT final review.

PR remains Draft / Open / unmerged until ChatGPT accepts the Work.
