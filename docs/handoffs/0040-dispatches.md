# Work 0040 dispatch control

WORK_ID: 0040
DISPATCH_ID: 0040-CODEX-02
ACTIVE_DISPATCH_ID: 0040-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: TARGET RUNTIME EVIDENCE CLOSURE

## Primary Outcome

Past Meeting detail/edit UIからunused/internal controlsを除去し、legacy valuesとrelated-material functionalityをpreserveする。

## Authoritative sources

- `docs/handoffs/0040-past-meeting-edit-cleanup-requirements.md`
- `docs/planning/work0040-past-meeting-edit-cleanup.md`
- `docs/handoffs/0040-CODEX-01-past-meeting-edit-cleanup-instruction.md`
- `docs/handoffs/0040-CODEX-01-past-meeting-edit-cleanup-report.md`
- `docs/handoffs/0040-CODEX-02-runtime-legacy-preservation-qualification-instruction.md`

## ChatGPT review gate

CODEX-01 implementation / tests / version20 runtime evidenceはreview済み。merge前に残るblockerは1件のみ:

- non-empty legacy `followUpRequired` / `followUpNote`を持つsynthetic Meetingのactual deployed UI unrelated edit/save後に、legacy valuesと`relatedPitchbookIds`がauthoritative readbackで不変であることの直接runtime evidence。

CODEX-02はこのevidence closureのみを行う。PASSなら実装・bundle・deployment変更は不要。

## Closed decisions

- follow-up edit UI hidden
- detail follow-up attributes hidden
- related edit selector hidden robustly
- legacy values preserved
- primary/detail actions left aligned
- raw Document_ID hidden
- existing-link button retained via human-readable picker
- add-files preserved

## Safety

```text
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
WORK_0030: DEFERRED_BY_USER
```

```text
NEXT_UNUSED_DISPATCH: 0040-CODEX-03
WORK_0040_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0040
DISPATCH_ID: 0040-CODEX-02
BALL: CODEX
STATUS: READY