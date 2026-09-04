# Work 0026 report

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-03`
BALL: `CODEX`
STATUS: `READY`

## Current state

CODEX-02 repaired and qualified the normal private Web App shell on version 69. OpenAI and API-independent FULL_OUTPUT remain production-capable. Gemini remains disabled and hidden, so normal product availability has no blocker.

The exact `gemini-3.8-flash / low / 2048` Interactions + File Search qualification failed after approximately 79 seconds. Exact Store/source readback and duplicate checks passed, but the returned evidence did not identify whether the failure was provider-terminal, no grounded answer, no citation, citation mapping, or response shape.

## Independent ChatGPT review

PR #36 remained Draft/Open/unmerged and its head matched `36d748828e9fd16368266e09d095426126586d06`. No review threads or GitHub Actions runs were present.

The relevant source shows that any non-access Gemini qualification exception writes `DISABLED_EXTERNAL_LIMITATION` and is then replaced by generic `AI_MODEL_QUALIFICATION_FAILED`. The transport retains only a coarse terminal status while discarding safe Interaction error-code evidence before the administrator result is classified.

Therefore CODEX-02's fail-closed product state is accepted, but its terminal external-cause classification is not.

```text
PRODUCT_AVAILABILITY_BLOCKER: NONE
WORK_ACCEPTANCE_BLOCKER: GEMINI_EXTERNAL_LIMITATION_CLASSIFICATION_NOT_EVIDENCED
PR_36_MERGE: BLOCKED
```

## Closed evidence

```text
PRIVATE_WEB_APP_VERSION: 69
WEB_APP_ROOT_RENDER: PASS
WEB_APP_KNOWLEDGE_RENDER: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
SOURCE_DELIVERY_READBACK: PASS / 82 of 82
GEMINI_KEY_AND_STORE: accessible
DOC-000017_EXACT_DOCUMENT: 1
MTG-000005_EXACT_DOCUMENT: 1
GEMINI_DOCUMENT_DUPLICATES: 0
OPENAI_ACCEPTED_PATH: preserved
OPENAI_API_CALLED: NO
FULL_OUTPUT_LIVE_CALLED: NO
LOGIC_VALIDATION: PASS / 410 of 410
BUNDLE_PARITY: PASS
VERSION_67: unused / never deployed
VERSION_70_OR_HIGHER_AT_CODEX_02: not created
```

## Active CODEX-03

CODEX-03 is limited to:

```text
safe failure-classification repair
focused deterministic failure matrix
one source delivery/readback
one version 70 creation
one same-Web-App update 69 -> 70
shell smoke
read-only exact source preflight
one required 3.8 Interactions query
at most one mutually exclusive 3.7 fallback or 3.8 GenerateContent control
```

Terminal outcome must be:

```text
QUALIFIED
or exact DISABLED_EXTERNAL_LIMITATION
or BLOCKED_PRODUCT_DEFECT
```

Detailed instruction:

`docs/handoffs/0026-CODEX-03-gemini-failure-classification-and-bounded-requalification-instruction.md`

## Classification

### BLOCKER — Work acceptance / PR merge only

- `GEMINI_EXTERNAL_LIMITATION_CLASSIFICATION_NOT_EVIDENCED`

### No product-availability blocker

- OpenAI and FULL_OUTPUT remain available;
- Gemini is safely disabled and hidden;
- shell, source identity and duplicate controls pass.

### FIX SOON

- GitHub CI remains absent;
- automated Chrome native file selection remains unreliable.

### DEFERRED

- representative large-file indexing;
- historical-material migration;
- final company Shared Drive/domain-user rollout and company credential qualification.

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
