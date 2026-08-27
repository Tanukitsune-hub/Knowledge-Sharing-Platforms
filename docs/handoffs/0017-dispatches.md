# Work 0017 dispatch control

WORK_ID: `0017`
DISPATCH_ID: `0017-CODEX-02`
BALL: `NONE`
STATUS: `ACCEPTED / MERGED / COMPLETE`

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

### 0017-CODEX-02 — RETURNED / QUALIFIED

- focused Activity Analytics suite: `8/8 PASS`;
- canonical repository validation: `231/231 PASS`;
- public facade: `26`; exact source readback: `67/67`;
- immutable version `37` created once and the same private Web App updated in place;
- Counterparty Type options `GP` and `LP_ASSET_OWNER` rendered in the actual Web App;
- selecting `LP_ASSET_OWNER` narrowed headline and drill results to one target, and clearing restored the four-Meeting baseline;
- Counterparty Type -> Team breakdown remained correct;
- final integrity PASS: five sheets, schema 5, unchanged records/files/settings/counters/AI state, 64 Audit rows, zero triggers;
- report: `docs/handoffs/0017-CODEX-02-counterparty-type-filter-finalization-report.md`.

## Final GitHub state

- PR #23: merged / closed;
- implementation head: `2670b8515e34197b3a34426ff41256f1ed1259ce`;
- merge commit: `0ed52ef16d8fcc267127fad85979eabf771075a9`;
- no active Codex dispatch remains.

## Accepted predecessor evidence

- Work 0016 accepted/merged under PR #21;
- Work 0022 accepted/merged under PR #22;
- Work 0017 evidence is completion-latched and must not be reopened absent material contradiction.

WORK_ID: `0017`
DISPATCH_ID: `0017-CODEX-02`
BALL: `NONE`
STATUS: `ACCEPTED / MERGED / COMPLETE`
