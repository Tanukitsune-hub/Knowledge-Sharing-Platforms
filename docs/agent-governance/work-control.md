# Outcome-Controlled Agent Work

This guide defines the execution control plane for Knowledge Sharing Platforms. Project-specific target-runtime policy is authoritative in `../decisions/target-runtime-first-development.md`.

## 1. Work Contract

Before substantial work, record the following in the task handoff or working plan:

| Field | Required content |
|---|---|
| Work ID | Stable outcome/theme ID or `Not assigned` |
| Dispatch ID | For a Codex request, `<WORK_ID>-CODEX-<NN>`; otherwise `N/A` |
| Ball / status | Current owner and durable state under `dispatch-control.md` |
| Mode | `BUILD`, `INCIDENT_RECOVERY`, `INVESTIGATION`, or `QUALIFICATION` |
| Primary outcome | The user-visible or operator-visible capability that must exist |
| Acceptance evidence | The observable evidence that proves the outcome |
| Evidence hierarchy | Strongest to weakest admissible evidence for this task |
| Fastest safe decisive action | The cheapest reversible action most likely to settle the next decision |
| Target runtime | Actual Apps Script / Workspace / Web App / browser / Gemini surface that must work |
| Test-data boundary | Isolated synthetic/anonymized data, resource, folder, Spreadsheet, record, or namespace |
| Side-effect boundary | Disabled, dry-run, guarded, test-recipient, or explicitly enabled external effects |
| Staging decision | `Not required` by default, or a material reason for a separate runtime |
| Required scope | Work needed now |
| Non-goals | Adjacent work that must not enter this Work |
| Authorization boundary | External writes, deployments, destructive actions, data, exposure, billing, and approval limits |
| Execution budget | Retry, hypothesis, mutation, deployment, evaluator, or handoff limits when material |
| Strategy-reset trigger | Condition that ends the current approach |
| Closed conclusions | Previously proven facts that may not be reopened without contradictory evidence |
| Follow-ups | Non-blocking issues routed outside current scope |

A short issue-style prompt is enough when risk is low and these fields are obvious. Route B/C uses the Dispatch ID and current-ball protocol in `dispatch-control.md`.

## 2. Choose one mode

### BUILD

Use for new behavior, bounded fixes, refactors, and routine delivery.

Default sequence:

1. inspect only enough source, state, and constraints to identify the shortest safe slice;
2. implement that slice directly in production source paths and the actual target runtime;
3. use isolated test data/resources and guard external side effects;
4. run focused logic validation;
5. run a target-runtime smoke or integration readback as soon as the slice can execute;
6. fix observed incompatibilities before expanding the feature surface;
7. enable production data, users, triggers, billing, broad exposure, or destructive effects only when separately authorized;
8. stop when acceptance evidence passes and residuals are routed.

Do not postpone all Apps Script / Workspace / browser evidence until feature-complete. Do not create a separate DEV/Staging runtime by habit.

Default budget when a handoff does not specify one: at most two speculative repair attempts for the same failure class before strategy reset. Deterministic fixes supported by new evidence do not count as speculative.

### INCIDENT_RECOVERY

Use when a previously usable capability is unavailable or materially degraded.

1. assess user impact and protect data;
2. restore or mitigate with the safest reversible action;
3. verify service or user capability;
4. close the recovery outcome;
5. perform root-cause analysis and durable prevention separately unless required for safe restoration.

Do not require complete root-cause certainty before an authorized low-risk recovery. Do not redesign the product during an outage.

Default budget: one authorized reversible mitigation path, plus one fallback only when predeclared and independently safe. Stop if impact worsens or the operation crosses the authorization boundary.

### INVESTIGATION

Use when the primary deliverable is a diagnosis or decision rather than a code change.

- Maintain one active hypothesis.
- Write the observation that would confirm or falsify it.
- Run only tests whose result changes the next action.
- Prefer instrumentation and authoritative state over another speculative patch.
- Separate facts, inference, and unresolved alternatives.

Default budget: two falsified hypotheses within one strategy. After that, reset the strategy or escalate.

### QUALIFICATION

Use to establish readiness or evidence against a fixed matrix.

- Define the matrix and evidence rules before execution.
- Preserve stateful or one-use evidence.
- Stop the affected matrix at the first material application or data-integrity defect when retries would contaminate evidence.
- Do not repair inside the qualification run unless the handoff explicitly reclassifies the work and resets the evidence boundary.
- An infrastructure or observer limitation is not automatically a product failure.

A stopped matrix does not automatically block independent matrices. Record dependent checks as `NOT RUN`, not failed.

## 3. Target-runtime-first development

### Definitions

- `TARGET_RUNTIME`: the actual Apps Script project/runtime, Workspace API behavior, Web App deployment shape, browser renderer, Gemini/File Search API, or final artifact behavior that must work.
- `ISOLATED_TEST_DATA`: synthetic/anonymized data and clearly segregated resources that can be created, inspected, and cleaned without touching authoritative production data.
- `SIDE_EFFECT_STATE`: whether triggers, Gemini billing, publication, destructive writes, broad access, real recipients, production data, or other consequential effects are disabled, dry-run, guarded, or explicitly enabled.

Target runtime is not the same as production data or public rollout:

```text
actual target runtime
+ isolated test data/resources
+ guarded side effects
→ logic validation
→ target-runtime evidence
→ authorized production data/exposure/effects
```

### Separate staging decision gate

A separate DEV/Staging runtime is justified only when at least one material condition applies:

- a mistake could irreversibly damage data or create unacceptable blast radius despite isolation and guards;
- legal, regulatory, security, tenant, or segregation requirements demand it;
- realistic concurrency, scale, migration rehearsal, public routing, or rollback cannot be tested safely in the target runtime;
- target-runtime activity would impose material billing, rate-limit, or operational disruption;
- the platform does not permit safe isolation or feature-flagged rollout;
- an explicit user or repository requirement mandates separation.

Record the reason and unique evidence. If a test folder, Spreadsheet, record prefix, isolated resource, inactive deployment, test recipient, disabled trigger, dry-run, or feature flag settles the same decision, prefer that simpler path.

## 4. Decision-Impact Gate

Before opening a new branch of work, answer:

1. Can this result change the primary outcome or next action?
2. Can it change safety, cost, public exposure, data integrity, or reversibility?
3. Is it required by acceptance criteria?

If all answers are no, route the item to `FOLLOW_UP` or `OPTIONAL`.

## 5. Evidence hierarchy and readiness

Declare evidence sources in task-specific order. A common KSP runtime hierarchy is:

1. authorized user-assisted observation in the actual target runtime;
2. authoritative Apps Script / Workspace / browser / persisted-state readback;
3. native automation against the actual target;
4. deterministic integration tests using production source paths;
5. unit, static, mock, contract, simulator, or synthetic harness checks;
6. static inspection and inference.

Security, permission, destructive, billing, and production-rollout work may require multiple independent evidence forms.

Record separately:

- `LOGIC_VALIDATION`: algorithms, transformations, schemas, contracts, security rules, and invariants;
- `TARGET_RUNTIME_QUALIFICATION`: actual Apps Script / Workspace / browser / Gemini behavior;
- `SIDE_EFFECT_STATE`: what is disabled, guarded, test-only, or enabled;
- `READY`: yes only when required evidence passes and no blocker remains.

Rules:

- CI, mock, simulator, synthetic harness, alternate runtime, or test-loader success does not establish target-runtime readiness;
- a helper, function, permission, API, data shape, or service available only in a harness is not target capability;
- stronger evidence may close a conclusion despite a weaker observer being unable to act;
- observer inability is `AUTOMATION_LIMITATION`, not an application failure;
- contradictory stronger evidence reopens the conclusion;
- record what was observed, not what a tool was expected to observe.

## 6. Execution budgets and loops

When material, state numeric limits before execution. Typical defaults:

- speculative patches for one failure class: 2;
- live external mutations of one target: 1 unless rollback/fallback is predeclared;
- evaluator-improvement cycles: 2 unless objective scoring justifies more;
- full validation: once after targeted checks, then again only after material change;
- identical tool failure: no immediate blind retry.

## 7. Strategy reset

Trigger a strategy reset when:

- the declared budget is exhausted;
- the same failure class recurs after materially different attempts;
- a design or source-of-truth assumption changes;
- a DEV/harness result does not transfer to the target runtime;
- handoffs or context summaries replace the original outcome;
- compaction or long context causes repeated work;
- the next proposed action cannot pass the Decision-Impact Gate.

Reset by restating the primary outcome, closed evidence, eliminated hypotheses, blocker layer, cheapest safe decisive action in the target runtime, and follow-ups. Start a fresh run when context contamination is plausible.

## 8. Completion latch

Once primary acceptance evidence passes:

- mark the outcome `CLOSED`;
- do not reopen it because a weaker automation tool cannot reproduce the action;
- do not add new success criteria;
- complete reporting and route residual issues;
- reopen only for material contradictory evidence, a failed required check, or explicit new scope.

For runtime-dependent BUILD work, completion normally requires required logic validation and target-runtime qualification. Production data, broad rollout, billing, triggers, or destructive effects may remain disabled when outside the authorized outcome.

## 9. Delegation

Use a single outcome owner. Add subagents only for independent work with positive expected value, such as read-heavy exploration, independent evidence review, security review, or parallel tasks with no overlapping writes. Avoid fixed counts, duplicate root-cause brainstorming, and multiple writers on the same files.
