# Work 0017 dispatch control

WORK_ID: `0017`
DISPATCH_ID: `0017-CODEX-02`
BALL: `NONE`
STATUS: `ACCEPTED / QUALIFIED`

## Dispatch history

### 0017-CODEX-01 — RETURNED / QUALIFIED WITH ONE UI DEFECT

- delivered Activity Analytics plus the binary `月次管理反映済み` admin check;
- deterministic validation `230/230 PASS` and focused `36/36 PASS`;
- schema 5 / exactly five Backend sheets;
- monthly/FY analytics, dimension switch, exact drill, admin-check persistence/Audit PASS;
- immutable version `36`, same private Web App updated in place;
- final integrity PASS;
- report recorded one remaining user-facing issue: Counterparty Type filter displayed only `未選択`.

### ChatGPT review / repair

GitHub review confirmed a one-key client/server mismatch:

- server: `filterOptions.counterpartyTypes`;
- client: `counterpartyType`.

ChatGPT fixed the client mapping and added a regression test on the same branch. No runtime mutation was performed by ChatGPT.

### 0017-CODEX-02 — READY

- mode: `BUILD / QUALIFICATION`;
- purpose: validate the ChatGPT fix, deploy the exact corrected source once, prove the Counterparty Type filter in the actual Web App, and close final integrity;
- model: `Luna Max`;
- branch: `agent/0017-meeting-activity-analytics`;
- Draft PR: `#23`;
- instruction: `docs/handoffs/0017-CODEX-02-counterparty-type-filter-finalization-instruction.md`;
- ChatGPT-fixed source baseline: `737f9888be6468eb9f30ef582d25caf33b882775`.

### 0017-CODEX-02 — ACCEPTED

- focused Activity Analytics suite: `8/8 PASS`;
- canonical repository validation: `231/231 PASS`;
- public facade: `26`; exact source readback: `67/67`;
- immutable version `37` created once and the same private Web App updated in
  place; no second Web App deployment or Library mutation;
- Counterparty Type filter options `GP` and `LP_ASSET_OWNER` rendered in the
  actual Web App;
- selecting `LP_ASSET_OWNER` narrowed headline and drill results to one target,
  and clearing restored the four-Meeting baseline;
- Counterparty Type -> Team breakdown remained `GP: 3`, `LP_ASSET_OWNER: 1`
  and `OPT-TEAM-001: 2`, `未設定: 2`;
- final integrity PASS: five sheets, schema 5, unchanged records/files/settings/
  counters/AI state, 64 Audit rows, zero triggers;
- report: `docs/handoffs/0017-CODEX-02-counterparty-type-filter-finalization-report.md`.

## Accepted predecessor evidence

- Work 0016 accepted/merged under PR #21;
- Work 0022 accepted/merged under PR #22;
- Work 0017 CODEX-01 schema/server/admin-check evidence remains accepted absent direct contradiction.

No active Codex dispatch remains for Work 0017.

WORK_ID: `0017`
DISPATCH_ID: `0017-CODEX-02`
BALL: `NONE`
STATUS: `ACCEPTED / QUALIFIED`
