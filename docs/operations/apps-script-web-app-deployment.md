# Apps Script Web App deployment and recovery guardrails

## Purpose

This document is the durable operating rule for Apps Script project identity, source synchronization, versioning, deployment, and Web App recovery in this repository.

It records the Work 0013 and Work 0014 incident lessons and prevents future agents from changing application code or the wrong deployment while the actual uncertainty is project, account, version, deployment, or entrypoint state.

## Incident lessons

The application was previously usable through an Apps Script Web App. During Work 0013, a Knowledge Search navigation failure led to repeated source-level hypotheses before the runtime identity chain had been fixed. During Work 0014, an attempted in-place deployment update reached a Library deployment because the target was not positively proven to be a Web App entrypoint before mutation.

The following execution mistakes materially increased risk or investigation time:

1. Application navigation code was changed before the exact chain of repository ref, Apps Script project, saved remote source, version, deployment, entrypoint type, URL, and browser account was fixed.
2. Deterministic source tests were treated as stronger evidence for live behavior than they actually provide.
3. Library deployments and Web App deployments were not consistently distinguished.
4. The absence of a local `.clasp.json` was initially treated as proof that project identity could not be recovered, although it is only a local mapping.
5. The editor-only `/dev` test endpoint was incorrectly used as a mandatory prerequisite for a normal versioned `/exec` deployment.
6. Several bounded runs changed or reconsidered navigation mechanisms before the deployment and serving layers were conclusively classified.
7. A deployment description, historical expectation, or deployment ID was treated as sufficient identity even though current entrypoint type had not been proven.
8. Reports accumulated faster than the underlying runtime state was simplified.

These were process and evidence-ordering failures. They do not establish that the application architecture or Apps Script Web Apps are inherently unable to support the required product.

## Permanent identity chain

Before any Apps Script push, pull, version, deployment, or runtime diagnosis, establish the following chain:

```text
Git ref
  -> local tested source
  -> Apps Script project identity
  -> remote saved source
  -> immutable version
  -> deployment
  -> entrypoint type
  -> execute-as / access
  -> browser account context
  -> observed execution
```

A later element must not be assumed from an earlier one.

Examples:

- matching source does not prove the correct deployment;
- a deployment description does not prove a `WEB_APP` entrypoint;
- an immutable version does not prove a Web App exists;
- a remembered or historical `/exec` does not prove the endpoint is currently active;
- a completed `doGet` does not prove the client rendered;
- a deterministic UI test does not prove live browser behavior;
- a `/dev` failure does not by itself prove a versioned `/exec` failure;
- a local `.clasp.json` is not authoritative project identity.

## Source-freeze rule

When project, version, deployment, entrypoint, URL, account, or serving-layer identity is uncertain:

- freeze application source;
- do not add another navigation mechanism;
- do not broaden the product architecture;
- do not push or pull over the repository worktree;
- classify the runtime layer first.

Source changes are permitted only after evidence identifies an application defect rather than a control-plane, account, deployment, or serving-layer problem.

## Deployment-type rule

Library, Web App, API executable, and add-on deployments are different entrypoint types.

For normal application recovery:

- create or select a deployment explicitly typed `Web app`;
- use a non-zero immutable version;
- use the approved execute-as and access settings;
- verify the selected endpoint is `/exec` and not `/library/`;
- never update or delete Library deployments merely to recover the Web App;
- create at most one recovery deployment per bounded run.

## Mandatory entrypoint proof before mutation

Before any CLI, API, or editor update to an existing deployment:

1. read current authoritative deployment metadata;
2. positively prove the target entrypoint type is `WEB_APP`;
3. positively prove the target exposes the intended `/exec` endpoint;
4. verify execute-as, access, description, and version separately;
5. record the pre-mutation deployment inventory privately for rollback comparison.

A deployment ID, description, version number, historical URL, or prior report is never sufficient by itself.

If the target is Library, ambiguous, absent, or does not expose `/exec`:

- do not issue an update command to that deployment;
- do not update a candidate merely because its description resembles the Web App;
- do not convert, repurpose, delete, or archive the Library deployment;
- use one explicitly authorized new Web App deployment through the editor instead;
- stop if a new Web App deployment is not authorized.

Any accidental mutation to a non-Web-App deployment must be restored immediately, independently read back, documented, and followed by a Strategy Reset before another deployment action.

## `/dev` and `/exec`

- `/dev` is an editor-only HEAD/test surface.
- `/exec` is the normal versioned Web App surface.
- `/dev` is useful diagnostic evidence but is not a universal prerequisite for creating or testing a versioned `/exec` deployment.
- Product acceptance is based on the intended versioned `/exec` path.
- If `/dev` and `/exec` differ, record the difference without forcing them into one diagnosis.

## Minimal recovery procedure

When project identity and remote source currentness are already proven:

1. Use the confirmed single-account editor context.
2. Inventory deployments and apply the mandatory entrypoint proof rule.
3. If no verified Web App exists, create exactly one new deployment explicitly typed `Web app`.
4. Use the approved description, execute-as, and access settings.
5. Confirm the resulting deployment is a versioned Web App and exposes `/exec`.
6. Open the generated `/exec` once.
7. If the main page renders, verify only the minimum authorized live path.
8. Confirm no unauthorized authoritative data mutation.
9. Stop on the first failure; do not create a second deployment or change source in the same run.

Do not add diagnostic phases that do not change the next decision.

## Evidence hierarchy

Use evidence in this order:

1. authoritative Apps Script project and deployment metadata;
2. observed browser result and corresponding Apps Script executions;
3. remote source comparison;
4. deterministic repository tests;
5. inference.

Clearly label inference and never promote it to confirmed root cause without runtime evidence.

## Secret and local-mapping handling

- `.clasp.json`, `.clasprc.json`, OAuth material, Script IDs, deployment IDs, private URLs, cookies, tokens, account identifiers, and credentials must remain untracked and unreported.
- A local clasp mapping may be reconstructed after project identity is independently proven.
- Remote comparison must use a disposable directory; never pull over the repository worktree.

## Handoff requirements

Every Apps Script deployment or recovery handoff must state:

- exact Git ref or accepted source commit;
- already-proven project and source evidence;
- whether application source is frozen;
- the one allowed deployment mutation;
- deployment type, execute-as, and access;
- mandatory entrypoint proof before any existing-deployment update;
- live acceptance path;
- authoritative integrity checks;
- explicit one-deployment and stop-on-first-failure rules;
- current BALL when authenticated user participation is required.

The handoff must reference this document and must not repeat historical investigations that no longer affect the next action.

## Current recovery principle

When source and project identity are already proven but no verified Web App exists, the shortest safe action is:

- do not change application source;
- do not update any Library or ambiguous deployment;
- create exactly one versioned synthetic DEV Web App through the editor;
- execute as the deploying user;
- restrict access to the deploying user;
- read back `WEB_APP` plus `/exec` before opening it;
- verify only the remaining accepted live path;
- verify no unauthorized authoritative mutation.
