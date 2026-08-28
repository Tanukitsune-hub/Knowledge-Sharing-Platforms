# Work 0020 — CODEX-03 schema 6 alignment and final runtime qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-03`
BALL: `CODEX`
STATUS: `COMPLETE / ACTION_REQUIRED`
MODE: `BUILD / QUALIFICATION`
ROUTE: `C`
RECOMMENDED_MODEL: `Sol High`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0020-ai-provider-core`
Draft PR: `#26`

## Primary outcome

Finish the existing Work 0020 implementation without redesign or unnecessary subdivision:

```text
three bounded full-output corrections
→ deterministic validation
→ bounded direct schema-6 alignment
→ exact corrected source sync/version
→ FULL_EXPORT runtime
→ enabled-provider File Search runtime
→ final integrity
```

## Accepted evidence — do not reopen

CODEX-02 established:

- provider-neutral implementation is present;
- `LOGIC_VALIDATION: PASS` — focused `50/50`, repository `254/254`, temporal/public-surface/diff checks PASS;
- public facade remains `28`;
- exact tested source was synchronized and read back;
- immutable Apps Script version `41` was created;
- the same private Web App was updated in place with its access boundary preserved;
- Backend remained exactly five sheets/schema `5` and no application data was mutated;
- `OPENAI_RUNTIME`, `GEMINI_RUNTIME`, `FULL_OUTPUT_RUNTIME`, and final integrity were not run.

Keep these source boundaries closed:

```text
ChatGPT / Gemini File Search
  → Meeting + Pitchbook/source materials

全文出力
  → authoritative Meeting Google Docs full text only
  → matching Pitchbooks are reference metadata + authoritative Drive links only
```

`0020-CODEX-01` remains superseded.

## Strategy reset conclusion

The unavailable private `setupKnowledgePlatform_()` selector is not a product defect and is not a terminal blocker.

The repository already has accepted precedent for isolated synthetic target alignment through the existing Backend and Project Settings surfaces when the private setup function cannot be invoked. Use that bounded route here. Do not add a public/debug wrapper, API-executable deployment, second Web App, or new administration framework.

## 1. Close three full-output findings before another sync

### A. One exact visible package

The on-page fixed-height preview, Clipboard copy, Google Docs, and PDF must all use the exact same `packageText` and package fingerprint.

Do not render only `meetingPreviewText` while Copy/Docs/PDF consume `packageText`.

Required behavior:

- the scrollable preview displays the full canonical package, including Meeting sections and any bounded Pitchbook reference section;
- Copy uses that exact string;
- Docs and PDF use that exact string/render model;
- one fingerprint proves parity;
- no hidden alternate body.

### B. Meeting-less FULL_EXPORT must fail closed

`全文出力` is a Meeting-Google-Docs full-text route. A selection containing only Pitchbooks/reference rows is not a valid full output.

Required behavior:

- `meetingCount === 0` produces a clear no-result/hard-stop state;
- Copy/Docs/PDF remain disabled;
- a Pitchbook-only filter cannot create a reference-only artifact labelled `全文出力`;
- matching Pitchbooks may supplement a package only when at least one Meeting body is included.

### C. Validate reference Pitchbook identity without reading bytes

Restore bounded reference integrity checks for every Pitchbook listed by FULL_EXPORT:

- stored `File_ID` is present;
- stored URL identifies the same file;
- Drive metadata confirms the file exists, is not trashed, and is not a folder;
- any returned web-view link identifies the same file.

This is metadata validation only. Do not read Pitchbook body text, media, Blob, or bytes for FULL_EXPORT.

Update regressions so they prove metadata validation occurs and byte/body extraction remains zero.

## 2. Deterministic gate

After the three corrections:

- run focused provider-core, Knowledge Export, UI, and setup tests;
- run `npm run check`;
- run temporal and public-surface validators;
- require public facade `28`;
- run `git diff --check`;
- inspect the relevant final diff once;
- confirm no credential, private Store ID, private URL, or unrelated refactor entered GitHub.

Do not perform another source synchronization before this gate fully passes.

## 3. Bounded schema 5 → 6 target alignment

First snapshot and privately compare:

- Backend sheet names, headers, row counts, stable IDs, and relevant row hashes;
- Settings rows and counters;
- `KSP_INSTALLATION_STATE_JSON` excluding secret/private values from reports;
- Audit count;
- Drive source/export inventory;
- triggers;
- deployment and Library metadata.

Then, using the existing Backend and Project Settings surfaces only:

1. keep exactly five Backend sheets;
2. append `AI_Provider_State_JSON` to the end of `Meeting_Index` only if absent;
3. append `AI_Provider_State_JSON` to the end of `Pitchbook_Index` only if absent;
4. do not reorder, rename, or rewrite any existing header;
5. do not bulk-populate the new cells — blank values are valid and the accepted parser lazily preserves legacy Gemini state until the provider writes its own state;
6. add only missing Settings rows with these initial values:
   - `OPENAI_ENABLED = false`;
   - `OPENAI_VECTOR_STORE_ID = blank`;
   - `OPENAI_DEFAULT_MODEL = blank`;
   - `GEMINI_ENABLED = false`;
   - `GEMINI_DEFAULT_MODEL = blank`;
7. preserve any existing value instead of overwriting it;
8. update only the established Settings schema-version value from `5` to `6`;
9. after Backend readback passes, update only `KSP_INSTALLATION_STATE_JSON.schemaVersion` from `5` to `6`;
10. preserve every resource/config ID and unrelated property field;
11. read back once and prove a second evaluation would make no change.

Do not claim `setupKnowledgePlatform_()` ran. Record that bounded direct alignment was used.

## 4. Corrected source delivery

Because CODEX-03 contains source corrections, after deterministic PASS and schema alignment:

- synchronize the exact corrected tested source once;
- perform exact source readback;
- create exactly one immutable Apps Script version — verify the natural next version rather than assuming it;
- update the same positively identified private Web App in place;
- preserve Web app type, execute-as deploying user, and `Only myself` access;
- do not create another Web App deployment;
- do not touch Library deployments.

## 5. FULL_OUTPUT runtime first

Use existing synthetic/non-confidential records only.

Prove:

- at least one Meeting Google Doc body is included in full;
- zero Meeting matches gives the new clear hard stop;
- matching Pitchbooks are references/links only;
- reference Pitchbook metadata is validated;
- Pitchbook body/file bytes are not read;
- source count, Meeting count, Meeting character count, and reference-Pitchbook count are correct;
- Copy/Docs/PDF buttons are above the output body;
- the bottom preview has bounded height and internal scrolling;
- the preview text equals the copied package text;
- one Google Doc and one PDF are created from the same package/fingerprint;
- no OpenAI or Gemini request occurs through FULL_EXPORT.

Do not repeat an output action merely because the browser harness cannot inspect the OS Clipboard. Use the strongest available application/server readback and classify browser-only limitations separately.

## 6. Provider capability and runtime matrix

Privately inspect provider settings/credential availability without exposing secrets or Store IDs.

For every deliberately disabled provider:

- select the route once;
- require its provider-specific safe error;
- prove zero call/failover to the other provider.

For every enabled and configured provider:

- confirm isolated test Store identity;
- index one Meeting and one Pitchbook/source;
- directly retrieve and cite each source type;
- map each citation through stable `source_type + source_id` to the authoritative Backend and Drive link;
- prove one exact metadata filter;
- update/reindex without duplicate active documents;
- prove Inactive exclusion;
- prove Reactivate restoration;
- delete/rebuild by exact derived identity;
- record bounded latency, polling, retry, rate-limit, cost, and retention evidence.

If OpenAI is enabled and credentialed but no test Vector Store ID exists, use or implement the smallest private adapter path to create exactly one isolated test Vector Store and persist only its ID in the existing Settings row. Do not expose it in browser/Audit/GitHub/report text.

If neither provider is enabled/configured after safe inspection:

- complete schema 6 and FULL_OUTPUT qualification;
- complete both disabled-provider/no-failover checks;
- complete all possible final integrity checks;
- stop with `ACTION_REQUIRED — AT_LEAST_ONE_FILE_SEARCH_PROVIDER_CONFIGURATION`;
- do not invent credentials, enable a provider silently, or claim File Search PASS.

Overall Work PASS still requires at least one live File Search provider.

## 7. Final integrity

Compare to the pre-alignment snapshot and prove:

- exactly five Backend sheets/schema `6`;
- only the two authorized append-only headers and missing provider Settings rows were added;
- existing source rows, stable IDs, statuses, files, Docs, Masters, counters, and non-provider metadata remain intact except the explicitly bounded synthetic provider lifecycle;
- provider states remain independent;
- no duplicate active provider document for a source;
- Audit contains only permitted bounded metadata and no question, answer, chunks, source bodies, credentials, raw provider payload, or private Store ID;
- only expected test export artifacts exist;
- no recurring trigger;
- no permission or Library mutation;
- one corrected source sync, one immutable version, and one in-place Web App update in CODEX-03.

## 8. Delivery

Create:

`docs/handoffs/0020-CODEX-03-schema6-alignment-and-runtime-qualification-report.md`

Update:

- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR #26 body.

Commit and push all scoped changes. Keep PR #26 Draft / Open / unmerged for ChatGPT final review.

Report:

```text
WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-03
LOGIC_VALIDATION
SCHEMA_ALIGNMENT
OPENAI_RUNTIME
GEMINI_RUNTIME
FULL_OUTPUT_RUNTIME
APPLICATION_DATA_SIDE_EFFECT_STATE
PROVIDER_STORE_SIDE_EFFECT_STATE
EXPORT_ARTIFACT_SIDE_EFFECT_STATE
DEPLOYMENT_SIDE_EFFECT_STATE
FINAL_INTEGRITY
READY
BLOCKER
```

On full PASS classify:

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS under enabled-provider matrix
FULL_OUTPUT_RUNTIME: PASS
READY: YES for personal-PC provider core
BLOCKER: NO
```

## CODEX-03 execution result

CODEX-03 completed the bounded source corrections, schema 6 alignment,
FULL_OUTPUT target-runtime qualification, disabled-provider/no-failover
checks, and final integrity. Both File Search providers were read back as
disabled and unconfigured, so the required stop classification is:

```text
ACTION_REQUIRED — AT_LEAST_ONE_FILE_SEARCH_PROVIDER_CONFIGURATION
READY: NO
BLOCKER: YES
```

No provider was enabled, no credential or Store was created, and PR `#26`
remains Draft / Open / unmerged for ChatGPT final review.
