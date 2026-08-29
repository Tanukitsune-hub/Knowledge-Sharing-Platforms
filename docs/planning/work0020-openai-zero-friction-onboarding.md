# Work 0020 — zero-friction OpenAI onboarding and project switch

WORK_ID: `0020`

Status: Planned immediately after the active Gemini qualification dispatch returns.

Route: `ChatGPT / OpenAI File Search`

Purpose: make personal-DEV setup and later company deployment operable by a non-specialist without manually managing model IDs, Vector Store IDs, API endpoints, provider metadata, Settings rows, or Apps Script internals.

## Primary outcome

An administrator can set up OpenAI from the existing private Web App with this normal flow:

```text
1. Paste an OpenAI project API key
2. Press 「APIキーを保存して接続確認」
3. Wait for the built-in synthetic connection test
4. Press 「資料を同期して利用開始」
```

No additional coding, Codex run, Vector Store creation, model selection, Settings-sheet editing, or Script Properties editing is required in the normal path.

The same flow must work first with the user's personal OpenAI project and later with a company-approved OpenAI project/key.

## Product principle

The operator chooses outcomes, not infrastructure.

The UI may expose:

```text
未設定
接続確認中
接続済み・同期前
同期中
利用中
要確認
無効
```

The UI must not expose or require understanding of:

```text
Project ID
Vector Store ID
File ID
provider document ID
model ID
API endpoint
metadata schema
chunking strategy
retry policy
HTTP status details
Apps Script Project Settings
```

Safe technical error codes may be available only in a collapsed support detail, never as the primary instruction.

## Normal administrator UI

Use the existing administrator-only AI provider settings page. The OpenAI card should contain only:

```text
ChatGPT / OpenAI

APIキー: 未設定 / 設定済み
接続状態: 未確認 / 接続済み / 要確認
資料同期: 未開始 / 同期中 / 一部完了 / 完了

[ APIキーを保存して接続確認 ]
[ 資料を同期して利用開始 ]
[ 無効化 ]
```

The first button includes a password-type API-key field. After submit, clear the browser field immediately.

Optional maintenance actions may sit behind a collapsed `詳細設定` section:

```text
APIキーを入れ替える
接続を再確認する
同期を続ける
OpenAI派生データを再構築する
接続情報を解除する
```

Normal users must never see this page or invoke its mutations.

## One unavoidable external step

The only unavoidable step outside the Web App is creating an OpenAI project API key in the OpenAI dashboard.

For personal DEV, use a dedicated personal development Project and a Project-scoped key. For company deployment, use a separate company-approved Project and key. OpenAI project resources such as files and vector stores are project-scoped and cannot be moved between projects, so personal and company environments must not share a Vector Store.

The Web App must not ask the user to copy a Project ID or Vector Store ID.

## API-key handling

Preferred normal path:

1. administrator pastes the key into the Web App password field;
2. the browser sends it once to an administrator-authorized server function;
3. the server writes it directly to Script Properties;
4. the server never returns the key;
5. the client clears the field;
6. all UI readback is boolean only: `設定済み / 未設定`.

Security requirements:

- never store the key in Backend Sheets, HTML, browser storage, Audit, GitHub, reports, logs, or exported files;
- never echo the key or a substring of it;
- never include the key in an exception message;
- enforce administrator authorization server-side, not merely by hiding the button;
- fail closed when identity cannot be established;
- overwrite and delete are permitted, readback is not;
- keep a manual Script Properties route only as a documented fallback when company security policy explicitly forbids entering credentials through the Web App.

## Connection-test transaction

Pressing `APIキーを保存して接続確認` must not index real Meeting/Pitchbook data.

The transaction is:

```text
OpenAI route disabled during setup
-> save/replace key in Script Properties
-> validate credential and model availability
-> read existing Vector Store when one is configured
-> reuse it when accessible from the current key/project
-> otherwise create exactly one Vector Store for the current project
-> run an in-memory synthetic File Search smoke test
-> clean up the synthetic test file/document
-> mark connection READY only after full PASS
```

### Existing Store behavior

If the configured Vector Store is accessible with the current key:

- reuse it;
- do not create another Store.

If the configured Store is inaccessible because the key belongs to another Project or the Store no longer exists:

- keep OpenAI disabled during the transition;
- create one new Store using the current key;
- switch the local Store reference only after create/readback/self-test PASS;
- reset only OpenAI-derived source states to `NotIndexed` because old provider document identities cannot be reused;
- preserve Gemini state and all authoritative Meeting/Pitchbook data;
- show the simple user message: `OpenAIの接続先が変わりました。資料を再同期してください。`

If credential validation fails:

- keep OpenAI disabled;
- do not create a Store;
- do not modify source provider states;
- show: `APIキーを確認してください。利用は開始されていません。`

### Model behavior

No user-facing model selector.

- preserve an existing product-approved model when it is still valid;
- otherwise select a File Search-capable model from a product-owned ordered allowlist;
- default to the current cost-balanced approved model at implementation time;
- never silently escalate to a materially more expensive model tier beyond the configured cost policy;
- a model-access failure leaves the route disabled and returns one simple action.

## Synthetic OpenAI self-test

The connection test uses no Meeting or Pitchbook content.

Create one tiny in-memory synthetic text file containing a unique harmless marker. Then prove end-to-end:

1. upload to OpenAI Files;
2. attach to the selected Vector Store with synthetic-only stable attributes;
3. wait for vector-store indexing status `completed`;
4. call the Responses API with `file_search` and an exact synthetic metadata filter;
5. require the unique marker in the grounded result;
6. require a citation to the synthetic File;
7. remove the Vector Store attachment;
8. delete the uploaded File;
9. verify no duplicate synthetic File remains.

The Vector Store itself remains for later real-source synchronization.

The self-test is bounded to one tiny file and one query. It must not call Gemini, read Drive source bodies, or perform provider failover.

## Connection and activation states

Use a separate connection/readiness state from the normal user-route enablement flag.

Recommended semantic states:

```text
UNCONFIGURED
TESTING
READY_FOR_SYNC
ACTIVE
DISABLED
ERROR
RECONNECT_REQUIRED
```

`OPENAI_ENABLED` must not become true merely because a key exists.

Recommended behavior:

- self-test PASS -> `READY_FOR_SYNC`, normal OpenAI search remains unavailable until source synchronization is explicitly started;
- `資料を同期して利用開始` -> run the existing provider-neutral bounded sync for OpenAI, then set `OPENAI_ENABLED=true` only after the first safe batch succeeds;
- remaining backlog may continue through the same button, relabeled `同期を続ける`, with a simple remaining count;
- no recurring trigger is introduced in Work 0020;
- queries use only successfully indexed sources and show synchronization status clearly.

## Source synchronization UX

The administrator must not choose source IDs or edit provider state.

The page shows safe counts only:

```text
Meeting: 同期済み 12 / 対象 15
Pitchbook: 同期済み 8 / 対象 10
失敗: 0
```

Primary action:

```text
[ 資料を同期して利用開始 ]
```

If Apps Script execution limits require multiple bounded batches, the same location becomes:

```text
[ 同期を続ける ]
```

No specialist judgment is required. Safe failure messages provide one next action:

```text
接続を再確認
同期を再開
管理者へ連絡
```

Do not ask the operator to manipulate retry counters, provider document IDs, or Backend rows.

## Personal DEV qualification

After the active Gemini dispatch returns, continue under Work 0020 with the natural next Codex Dispatch.

The personal OpenAI qualification uses the user's personal development Project/key and synthetic/non-confidential sources only.

Required evidence:

1. administrator-only key-entry UI stores the key in Script Properties without leakage;
2. credential and model capability readback PASS;
3. Vector Store create-or-reuse behavior PASS;
4. repeated connection test reuses one Store and does not create duplicates;
5. synthetic upload/index/query/citation/cleanup self-test PASS;
6. one synthetic Meeting index/query/citation PASS;
7. one small synthetic Pitchbook index/query/citation PASS;
8. exact metadata filter PASS;
9. update/reindex without duplicate PASS;
10. Inactive exclusion/removal PASS;
11. Reactivate restoration PASS;
12. exact delete/rebuild PASS;
13. no Gemini fallback;
14. no key/Store ID/source body/raw response in browser, Audit, GitHub, or report;
15. final integrity PASS.

User action during this dispatch is limited to pasting the personal API key into the Web App and pressing the connection button. The key must never be pasted into chat or Codex.

## Company deployment and key replacement

Company deployment uses the same code and operator experience:

```text
1. Paste the company-approved Project key
2. Press 「APIキーを保存して接続確認」
3. Confirm 「接続済み・同期前」
4. Press 「資料を同期して利用開始」
```

The app automatically handles:

- a fresh company environment with no Store;
- a copied configuration containing an inaccessible personal/old Store ID;
- a rotated key within the same Project;
- a key belonging to a different Project;
- source-state reset when the Store/Project changes;
- bounded initial synchronization and progress display.

The operator does not manually remove a personal Store ID, create a company Store, select a model, or edit Settings.

Company production qualification still separately verifies Shared Drive permissions, approved users, data policy, project/billing controls, provider access, and the intended production Web App. That qualification is checklist-driven and must not require the operator to understand provider internals.

## Disable, reconnect, and cleanup

`無効化`:

- immediately sets `OPENAI_ENABLED=false`;
- prevents query/index calls;
- preserves authoritative sources;
- preserves the current Store by default for easy re-enable.

`接続情報を解除する` behind advanced controls:

- requires a deliberate confirmation;
- removes the API key from Script Properties;
- clears local OpenAI Store/config references and OpenAI-derived source states;
- does not touch Gemini state or authoritative Drive content;
- may optionally delete currently accessible OpenAI-derived files/Store only when explicitly selected and successfully reconciled;
- never claims deletion of an inaccessible old-project Store.

## Audit and privacy

Allowed durable records:

```text
provider=OPENAI
setup action type
result
safe error code
safe source counts
qualified timestamp
```

Prohibited durable records:

```text
API key or fragment
Project ID unless explicitly approved as non-secret operational metadata
Vector Store ID
File/provider document ID
synthetic marker text
questions/answers
retrieved chunks
source body
raw provider payload
```

Responses API calls keep `store:false` under the existing product contract.

## Deterministic validation before personal live use

Tests must prove:

- normal/non-admin caller cannot save, replace, delete, test, enable, disable, or sync OpenAI;
- browser response never contains key or private provider IDs;
- key absent/invalid -> disabled, no Store, no real-source sync;
- valid mocked key + no Store -> exactly one Store created;
- repeated setup -> same Store reused;
- inaccessible old Store -> one new Store, atomic reference switch after PASS, OpenAI-only provider-state reset;
- failed replacement -> route remains disabled and previous authoritative data is unchanged;
- model selection is automatic and cost-policy bounded;
- synthetic self-test requires upload, completed index, exact filtered retrieval, citation, and cleanup;
- self-test never reads Meeting/Pitchbook bodies;
- self-test never calls Gemini;
- setup PASS does not automatically index real sources;
- activation sync reuses the provider-neutral source pipeline;
- sourceType-bounded sync remains available for Meeting/Pitchbook qualification and recovery;
- all existing Gemini/FULL_EXPORT tests remain green;
- public facade remains bounded;
- temporal validator, `npm run check`, and `git diff --check` PASS.

## Delivery sequence

```text
CODEX-09
  Gemini sourceType-bounded qualification and final runtime convergence

ChatGPT review
  preserve accepted evidence and classify remaining work

CODEX-10 (planned natural next Dispatch)
  implement zero-friction OpenAI onboarding
  pause once for user key entry in the Web App
  run personal OpenAI synthetic self-test
  run Meeting + Pitchbook OpenAI live qualification
  restore safe settings and report

ChatGPT final review
  merge Work 0020 only after enabled-provider matrix and final integrity PASS
```

Do not start CODEX-10 or edit the active Codex branch concurrently while CODEX-09 is running.

## Completion boundary

Work 0020 is complete when:

```text
GEMINI_RUNTIME: PASS for the enabled personal-DEV Gemini route
OPENAI_RUNTIME: PASS using the personal development Project/key
OPENAI_ZERO_FRICTION_ONBOARDING: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```

Company production readiness remains a later environment-specific qualification, but company OpenAI activation must require no new coding and no provider-infrastructure knowledge.

## Non-goals

- creating OpenAI Projects or API keys from the Web App;
- showing or retrieving a stored API key;
- automatic cross-provider failover;
- user-facing model or Store selection;
- automatic recurring synchronization trigger;
- moving provider resources between OpenAI Projects;
- claiming cleanup of resources the current key cannot access;
- bypassing company security, billing, or data-governance approval.

## Official reference assumptions to revalidate at implementation time

- OpenAI Project resources, including files and vector stores, are scoped to their Project and cannot be moved between Projects;
- Project-based keys are preferred for environment separation and usage controls;
- OpenAI File Search uses Files, Vector Stores, and the Responses API `file_search` tool;
- Vector Store file attributes are bounded, so stable-ID-first metadata remains required;
- the selected default model must support File Search at implementation time.
