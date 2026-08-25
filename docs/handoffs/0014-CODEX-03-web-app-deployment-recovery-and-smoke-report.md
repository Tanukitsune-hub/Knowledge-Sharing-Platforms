# Work 0014 — CODEX-03 Web App deployment recovery and smoke report

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-03`
BALL: `CODEX`
STATUS: `BLOCKED`

Execution date: `2026-08-26`

Instruction ref: `99edd2f519ffdd84970b6f6efb061b43047faaa8`

## Result

`NOT QUALIFIED — LIVE SMOKE STOPPED AT PITCHBOOK FUND / STRATEGY APPLICATION DEFECT`

`BLOCKER: YES`

## Deployment recovery

`PASS`

- Immediately before deployment, immutable version `26` was still latest and the saved remote source matched the accepted 59-file source tree.
- Exactly one new deployment was created as type Web app, execute as deploying user, access `Only myself`.
- Apps Script automatically created exactly one immutable version, `27`; no version was created manually.
- The new Web App deployment reads back as version `27` with a normal `/exec` entry point.
- All six pre-existing Library deployments remained unchanged; no second Web App deployment was created.
- No source, test, manifest, schema, Script Property, trigger, or Library deployment was modified.

No deployment ID, private URL, resource ID, or account identifier is recorded here.

## Main `/exec` gate

`PASS`

The new versioned `/exec` rendered the normal Knowledge Sharing Platforms main page. No page-not-found, Drive error, or fatal application error was observed.

## Synthetic DEV smoke

### Legacy Meeting

`PASS`

- Opened one existing legacy Meeting without saving it.
- Team, Fund / Strategy, Meeting types, Related Pitchbooks, and follow-up fields remained blank or unset.
- The record remained usable and unrelated legacy content was not modified.

### Rich Meeting round-trip

`PASS`

- Created exactly one synthetic Meeting with Team, non-empty Fund / Strategy, two Meeting types, one matching Related Pitchbook, follow-up enabled, and a synthetic follow-up note.
- Authoritative readback showed exactly one new Meeting row and exactly one source Doc, with no duplicate.
- Reopen preserved all structured fields.
- One structured field was edited and saved exactly once; the same Meeting and source references were preserved.
- Team + Meeting type + follow-up-only search returned the expected single record, including the edited Fund / Strategy and relationship.

### Relationship preservation

`PASS`

- The linked Pitchbook was privately confirmed as an Active synthetic DEV record.
- It was temporarily made Inactive exactly once using the normal UI.
- The existing Meeting retained the same Related Pitchbook association while the Pitchbook was Inactive.
- The Pitchbook was restored to Active and authoritative readback confirmed the restoration.

### Pitchbook Fund / Strategy

`FAIL — FIRST AUTHORIZED SAVE RETURNED A SAFE MANAGEMENT ERROR`

- Opened the same safe synthetic Pitchbook and entered a non-empty synthetic Fund / Strategy value.
- The edit form was submitted exactly once.
- The UI returned `管理処理を完了できませんでした。`.
- Authoritative Backend readback showed the Fund / Strategy value remained unchanged, the Pitchbook remained Active, its row count remained unchanged, and no duplicate or partial update was created.

Per the dispatch stop condition, no retry, source diagnosis, second hypothesis, or additional application mutation followed.

### Final integrity

`NOT RUN — STOPPED AT FIRST PITCHBOOK APPLICATION DEFECT`

The final authoritative integrity matrix was not executed after the first actual application defect. Evidence available at the stop point confirms the temporarily Inactive Pitchbook was restored to Active and the failed Fund / Strategy save caused no partial row update or duplicate.

## Classification

Work 0014: `NOT QUALIFIED — LIVE SMOKE STOPPED AT PITCHBOOK FUND / STRATEGY APPLICATION DEFECT`.

`BLOCKER: YES`

PR #17 remains Draft / Open / unmerged for ChatGPT review. Application implementation remains frozen in this dispatch.
