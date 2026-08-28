# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-02`
BALL: `CODEX`
STATUS: `BLOCKED`

## Target classification

```text
WORK 0020 AI PROVIDER CORE — QUALIFICATION BLOCKED
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: BLOCKED — private schema migration route unavailable
OPENAI_RUNTIME: NOT RUN
GEMINI_RUNTIME: NOT RUN
FULL_OUTPUT_RUNTIME: NOT RUN
APPLICATION_DATA_SIDE_EFFECT_STATE: GUARDED
PROVIDER_STORE_SIDE_EFFECT_STATE: NOT RUN
EXPORT_ARTIFACT_SIDE_EFFECT_STATE: NOT RUN
DEPLOYMENT_SIDE_EFFECT_STATE: GUARDED
READY: NO
BLOCKER: YES
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

## CODEX-02 execution result

The corrected implementation passed deterministic validation (`50/50` focused
tests, `254/254` `npm run check`, temporal validation, public facade `28`, and
`git diff --check`). The exact tested source was synchronized once, read back,
and deployed to the existing private Web App as immutable version `41` with
the Web App security boundary preserved.

Target Backend readback still showed exactly five sheets with schema-5
headers. The required schema 5 -> 6 migration was not executed because the
canonical private `setupKnowledgePlatform_()` route was unavailable: the
editor selector omitted the private function and bounded `clasp run` attempts
returned a permission error. No direct Backend or Script Property workaround
was used. OpenAI, Gemini, FULL_EXPORT, and final integrity qualification are
therefore `NOT RUN`; `BLOCKER: YES`.

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

`0020-CODEX-01` is superseded by the user-confirmed Meeting-only FULL_EXPORT boundary. Active execution was `0020-CODEX-02`; this dispatch is now blocked on the unavailable private schema-migration execution surface.
