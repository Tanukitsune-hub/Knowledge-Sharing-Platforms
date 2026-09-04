# Work 0027 — company GAS Gemini independent smoke evidence

WORK_ID: `0027`  
EVIDENCE_SOURCE: user-provided independent diagnostic result  
OBSERVED_RUNTIME: company Google Apps Script  
CONFIDENTIAL_DATA_USED: NO  
CREDENTIAL_VALUE_RECORDED: NO

## Purpose

Record the non-confidential observations that triggered Work 0027. The diagnostic tool was separate from Knowledge Sharing Platforms. This file records results only; it does not claim repository code produced them.

## Run 1

| Step | API / model | HTTP | Result | Duration | Safe observation |
|---|---|---:|---|---:|---|
| T1 | Models API | 200 | PASS | — | `gemini-3.6-flash` and `gemini-3.8-flash` visible |
| T2 | GenerateContent / 3.6 | 200 | content check failed | about 1.3s | response received; expected fixed token not confirmed |
| T3 | GenerateContent / 3.8 | 200 | content check failed | about 7.1s | response received; expected fixed token not confirmed |
| T4 | Interactions / 3.8 | 200 | PASS | about 52.9s | expected fixed token confirmed |

## Run 2

| Step | API / model | HTTP | Result | Duration | Safe observation |
|---|---|---:|---|---:|---|
| T1 | Models API | 200 | PASS | — | both models visible |
| T2 | GenerateContent / 3.6 | 503 | transient failure | about 42.0s | `UNAVAILABLE`, high-demand provider response |
| T3 | GenerateContent / 3.8 | 503 | transient failure | about 43.0s | `UNAVAILABLE`, high-demand provider response |
| T4 | Interactions / 3.8 | 200 | PASS | about 37.4s | expected fixed token confirmed |
| T5A | temporary File Search Store create | 200 | PASS | about 0.3s | temporary Store created |
| T5B | synthetic upload | no HTTP | client failure | about 0.8s | GAS rejected manually supplied ordinary `Content-Length` |
| T5E | temporary File Search Store delete | 200 | PASS | about 0.2s | cleanup succeeded |

## Established facts

- company GAS can reach Gemini API endpoints;
- the key and basic authentication work;
- both tested models are visible;
- `gemini-3.8-flash` Interactions works;
- GenerateContent can work and can also return transient 503 high-demand responses;
- File Search Store create/delete works;
- the upload failure was a diagnostic-client header defect before network transmission;
- File Search upload/index/query/citation is not yet qualified.

## Not established

- free-tier quota caused the 503;
- paid tier will eliminate 503;
- switching to `gemini-3.6-flash` improves stability;
- the full File Search E2E works;
- GenerateContent is generally unusable.

## Superseding effect

This evidence supersedes any continuing interpretation that Work 0026 proved the company GAS network path, API key, or `gemini-3.8-flash` was generally unavailable.

It does not invalidate the fact that the Work 0026 product qualification call failed or the accepted fail-closed behavior.
