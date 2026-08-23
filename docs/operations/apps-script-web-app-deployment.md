# Apps Script Web App deployment and recovery guardrails

## Purpose

This document is the durable operating rule for Apps Script project identity, source synchronization, versioning, deployment, and Web App recovery in this repository.

It records the Work 0013 incident lessons and prevents future agents from changing application code while the actual uncertainty is project, account, version, deployment, or entrypoint state.

## Work 0013 incident summary

The application was previously usable through an Apps Script Web App. During Work 0013, a Knowledge Search navigation failure led to repeated source-level hypotheses before the runtime identity chain had been fixed.

The following execution mistakes materially increased the investigation time:

1. Application navigation code was changed before the exact chain of repository ref, Apps Script project, saved remote source, version, deployment, entrypoint type, URL, and browser account was fixed.
2. Deterministic source tests were treated as stronger evidence for live behavior than they actually provide.
3. Library deployments and Web App deployments were not consistently distinguished.
4. The absence of a local `.clasp.json` was initially treated as proof that project identity could not be recovered, although it is only a local mapping.
5. The editor-only `/dev` test endpoint was incorrectly used as a mandatory prerequisite for a normal versioned `/exec` deployment.
6. Several bounded runs changed or reconsidered navigation mechanisms before the deployment and serving layers were conclusively classified.
7. Reports accumulated faster than the underlying runtime state was simplified.

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

## `/dev` and `/exec`

- `/dev` is an editor-only HEAD/test surface.
- `/exec` is the normal versioned Web App surface.
- `/dev` is useful diagnostic evidence but is not a universal prerequisite for creating or testing a versioned `/exec` deployment.
- Product acceptance is based on the intended versioned `/exec` path.
- If `/dev` and `/exec` differ, record the difference without forcing them into one diagnosis.

## Minimal recovery procedure

When project identity and remote source currentness are already proven:

1. Use the confirmed single-account editor context.
2. Create exactly one new deployment of type `Web app`.
3. Use the approved description, execute-as, and access settings.
4. Confirm the resulting deployment is a versioned Web App and exposes `/exec`.
5. Open the generated `/exec` once.
6. If the main page renders, verify the minimum normal navigation path.
7. Confirm no authoritative data mutation.
8. Stop on the first failure; do not create a second deployment or change source in the same run.

Do not add diagnostic phases that do not change the decision to create and test the one permitted versioned Web App.

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

- exact Git ref;
- already-proven project and source evidence;
- whether application source is frozen;
- the one allowed deployment mutation;
- deployment type, execute-as, and access;
- live acceptance path;
- authoritative integrity checks;
- explicit one-deployment and stop-on-first-failure rules.

The handoff must reference this document and must not repeat historical investigations that no longer affect the next action.

## Work 0013 current decision

The shortest safe recovery action is:

- do not change application source;
- create exactly one versioned synthetic DEV Web App in the already confirmed project;
- execute as the deploying user;
- restrict access to the deploying user;
- open the generated `/exec` once;
- verify the normal main page and same-document Knowledge Search navigation;
- verify no authoritative mutation.

The separate `/dev` Drive error remains diagnostic evidence but does not block this versioned recovery action.