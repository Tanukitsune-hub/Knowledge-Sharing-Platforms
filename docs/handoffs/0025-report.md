# Work 0025 report

WORK_ID: `0025`
ACTIVE_DISPATCH_ID: `0025-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Executive conclusion

CODEX-01 completed and target-runtime-qualified the major model/thinking policy vertical slice, but final review found one primary-contract gap that must be closed before PR #32 merges.

The current administrator qualification action tests the model/File Search path using `modelId` only. It does not pass the configured thinking raw value/provider-default omission or output ceiling, yet a successful model-only test marks the whole model profile qualified and exposes all enabled thinking choices.

Because model-specific thinking compatibility is intentionally unknown until tested, an unsupported configured thinking value can become user-selectable after an apparently successful qualification. CODEX-02 is limited to making qualification exact per user-selectable thinking tuple.

## Accepted CODEX-01 evidence

```text
MODEL_POLICY_REGISTRY: PASS
ADMIN_MODEL_CONTROL: PASS
USER_MODEL_SELECTOR: PASS
SERVER_SIDE_RAW_MODEL/THINKING_REJECTION: PASS
CURRENT_DEFAULT_MIGRATION: PASS
HISTORICAL_MODEL_REGISTRATION: PASS
NO_AUTO_LATEST_SWITCH: PASS
NO_COST_ESCALATION/CROSS_PROVIDER_FALLBACK: PASS
OPENAI DOC-000017 / MTG-000005 REGRESSION: PASS
LOGIC_VALIDATION: focused 74/74; canonical 341/341
TARGET_RUNTIME: same private Web App version 59
GITHUB_CI_ACTUALLY_RAN: NO
```

Detailed CODEX-01 report:

`docs/handoffs/0025-CODEX-01-model-policy-foundation-and-user-selection-report.md`

## Active blocker

```text
THINKING_PROFILE_QUALIFICATION_STATE: NOT IMPLEMENTED
QUALIFICATION_REQUEST_USES_EXACT_THINKING_VALUE: NO
QUALIFICATION_REQUEST_USES_OUTPUT_CEILING: NO
USER_CHOICES_REQUIRE_INDIVIDUAL_THINKING_QUALIFICATION: NO
READY_FOR_FINAL_MERGE: NO
BLOCKER: THINKING_PROFILE_QUALIFICATION_NOT_EXACT
```

Active instruction:

`docs/handoffs/0025-CODEX-02-thinking-profile-qualification-gate-instruction.md`

## Classification

### BLOCKER

- User-selectable thinking values are not individually qualified against the actual provider request shape.

### FIX SOON / BACKLOG

- provider model discovery;
- persistent per-user preference;
- exhaustive model/latency benchmarking;
- cosmetic administrator UI refinement.

These do not extend Work 0025 after CODEX-02.

WORK_ID: `0025`
ACTIVE_DISPATCH_ID: `0025-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
