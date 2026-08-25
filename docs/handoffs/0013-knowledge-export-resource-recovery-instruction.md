# Work 0013 — Knowledge Export resource recovery

WORK_ID: `0013`
MODE: `INCIDENT_RECOVERY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Target branch: `agent/0013-consolidated-dev-live-qualification`
Draft PR: `#11`

## Primary outcome

Restore the already-confirmed synthetic DEV installation so Knowledge Export Preview can reach its normal application path, then stop. Do not perform Matrix E qualification in this recovery run.

The current blocker is authoritative and narrow:

`KNOWLEDGE_EXPORTS_FOLDER_MISSING` / `Knowledge Exports folderが設定されていません。`

The application source already defines `Knowledge Exports` as a setup-managed resource. `kspRunSetup_()` resolves/reuses or creates that folder under the configured knowledge parent, saves it in installation state, and upserts Settings. `kspCreateKnowledgeExportEnvironment_()` requires the stored resource before Preview.

## Accepted evidence — CLOSED

Do not reopen:

- Apps Script project identity is confirmed.
- Remote Apps Script source is current.
- Versioned `/exec` renders normally.
- Integrated navigation is user-confirmed PASS.
- Matrix A/B/C and upload sizing are accepted.
- Matrix D is `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION` and is not part of this recovery.
- Matrix E failed only at Preview with the missing Knowledge Exports resource; Docs/PDF/clipboard/final integrity were not run.

## Fastest safe decisive action

Use the existing editor-only idempotent setup entrypoint exactly once on the already-confirmed synthetic DEV project:

`setupKnowledgePlatform_()` from `src/99_EntryPoints.gs`.

This is the canonical migration/repair path. Do not create a bespoke folder/state repair and do not change application source merely because the private return value is not conveniently observable.

Before execution:

1. Confirm the checkout/project is still the accepted synthetic DEV target.
2. Confirm `AI_SYNC_ENABLED=false`.
3. Read and privately record the current installation-state resource set, configured knowledge parent, relevant trigger state/count, and whether an exact-name `Knowledge Exports` folder already exists under that parent. Do not print private IDs/URLs in chat or reports.

Execution:

4. Execute `setupKnowledgePlatform_()` exactly once.
   - Prefer direct Apps Script editor execution.
   - If Codex browser control cannot select/click the private function safely, ask the user only to select `setupKnowledgePlatform_` and press Run once in the already-open confirmed project.
   - A visible return value is not required for this recovery. A completed Apps Script execution plus authoritative post-run readback is sufficient evidence.
5. Do not run setup a second time in this recovery.

Post-run authoritative readback:

6. Confirm installation state now contains the Knowledge Exports resource.
7. Confirm exactly one accessible folder exists for that resource under the configured knowledge parent.
8. Confirm Backend/Audit/source rows remain unchanged.
9. Confirm no duplicate core resources were created.
10. Confirm trigger state changed only if the canonical setup contract required a missing expected trigger; record any such change without private IDs. Unexpected trigger creation/deletion is a blocker.
11. Confirm `AI_SYNC_ENABLED=false` remains unchanged and no Gemini/File Search call occurred.
12. Open the existing versioned `/exec` and invoke `対象資料を確認` exactly once only as a recovery smoke check.

Recovery PASS requires:

- Preview no longer fails with `KNOWLEDGE_EXPORTS_FOLDER_MISSING`;
- a normal Preview result is returned for the existing synthetic Active source set;
- Preview creates no export artifact;
- no source/index/AI mutation occurs.

If this PASS condition is met, apply the Completion Latch to the recovery and stop. Do not create Docs/PDF/clipboard in this run. Matrix E qualification resumes in a separately renewed QUALIFICATION scope.

## Strategy reset / stop conditions

Stop immediately and report if:

- the confirmed DEV project cannot be proven before setup;
- `AI_SYNC_ENABLED` is not false;
- setup execution returns/records an application error;
- post-run readback shows duplicate core resources, unexpected source/Audit mutation, unexpected trigger mutation, or wrong-parent resource placement;
- Preview still reports the same missing-folder error after the one authorized setup;
- a different application/integrity defect appears during the single Preview smoke check.

Do not investigate a second root-cause hypothesis in this recovery run. Do not patch source, deployment, schema, public facade, Knowledge Export logic, AI logic, or limits.

## Non-goals

Do not:

- rerun `/dev` or deployment recovery;
- create another Web App deployment;
- rerun navigation, Matrix A/B/C, upload sizing, or Matrix D;
- create a manual replacement folder/state mapping outside the canonical setup path;
- configure Shared Drive or Gemini/File Search;
- execute Docs/PDF/clipboard/final Matrix E integrity qualification;
- migrate this repository to Core Rules 2.0 during Work 0013.

## Delivery

Update only the Work 0013 recovery/qualification reports and PR evidence as needed. Keep PR #11 Draft / Open / unmerged.

Report only:

- pre-run classification: missing folder vs missing stored mapping vs both;
- setup execution: PASS/FAIL;
- Knowledge Exports post-run resource readback: PASS/FAIL;
- duplicate/unexpected mutation check: PASS/FAIL;
- single Preview recovery smoke check: PASS/FAIL;
- recovery classification;
- BLOCKER status;
- report path;
- final commit SHA;
- branch and PR status.
