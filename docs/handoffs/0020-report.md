# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Target classification

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS under enabled-provider matrix
OPENAI_RUNTIME: PASS | DISABLED_BY_CONFIG
GEMINI_RUNTIME: PASS | DISABLED_BY_CONFIG
FULL_OUTPUT_RUNTIME: PASS
APPLICATION_DATA_SIDE_EFFECT_STATE: GUARDED
PROVIDER_STORE_SIDE_EFFECT_STATE: TEST_ONLY
EXPORT_ARTIFACT_SIDE_EFFECT_STATE: TEST_ONLY
DEPLOYMENT_SIDE_EFFECT_STATE: GUARDED
READY: YES
BLOCKER: NO
```

## Fixed source scopes

```text
ChatGPT / Gemini File Search
  -> Meeting + Pitchbook/source materials

全文出力
  -> Meeting Google Docs full text only
  -> optional Pitchbook reference metadata + Drive links
```

Pitchbook body/file extraction is not part of FULL_EXPORT.

## Evidence to record

- current official API/model/filter/citation/format/retention/cost preflight;
- schema 5 -> 6 and `AI_Provider_State_JSON` migration;
- provider-state independence and legacy compatibility;
- OpenAI metadata budget <= 16 attributes;
- enabled-provider Store/index/query/citation for both Meeting and Pitchbook/source;
- stable citation -> Backend -> authoritative Drive link for both source types;
- enabled-provider update/inactivate/reactivate/delete/rebuild lifecycle;
- disabled-provider safe error and no failover;
- FULL_EXPORT authoritative Meeting Google Docs package;
- optional Pitchbook reference-only behavior without body/byte extraction;
- Copy/Docs/PDF package fingerprint parity;
- public surface, source readback, Apps Script version/deployment identity;
- final Backend/Audit/Settings/Script Properties/trigger/source/Store integrity.

## Dispatch history

`0020-CODEX-01` is superseded by the user-confirmed Meeting-only FULL_EXPORT boundary. Active execution is `0020-CODEX-02`.
