# Work 0050–0053 overnight stacked implementation plan

Status: READY
Start condition: SATISFIED — Work0049 ACCEPTED / Completion Latch APPLIED
Execution owner: CODEX
Final acceptance owner: CHATGPT

## Purpose

Work0050–0053を1回のCodex runで順番に実装し、翌朝のChatGPT review前にできるだけ多くの実装・deterministic verificationを完了させる。

これは4 Workを1つへ統合するものではない。
各Work ID / requirements / report / branch / Draft PR / Dispatch IDは独立して維持する。

## Why stacked / why no unattended live deployment

Work0050–0053はそれぞれ別Outcomeで、後続Workは前段の変更を含むbaselineを必要とする。

一方、ChatGPT final reviewなしで以下を夜間に自動実行するのは避ける:
- production merge
- Apps Script live deployment
- real Backend backup trigger作成
- real Drive backup folder/file mutation
- provider query/mutation
- destructive or business-data mutation

特にWork0051はtrigger / Drive retentionを扱うため、unreviewed implementationをlive environmentへ投入しない。

したがってovernight runは:
- implementation
- repository tests
- bundle validation
- synthetic/browser deterministic verification
- Draft PR作成
まで。

Target-runtime qualification / deployment / merge / Completion Latchは翌朝ChatGPT review後に順次実施する。

## Sequence

### Stage 1 — Work0050 / Dispatch 0050-CODEX-01

Base:
- latest main after Work0049 ACCEPTED

Branch:
- `codex/0050-theme-color-tool`

Draft PR base:
- `main`

Implement:
- Theme Color Tool
- saturation/value picker
- hue slider
- HEX / RGB
- copy
- 16 Theme token apply
- existing live preview integration
- optional Eyedropper progressive enhancement

No live deployment.

Return evidence:
- focused tests
- browser synthetic 1440 / 390
- bundle / check
- no persistence schema change

### Stage 2 — Work0051 / Dispatch 0051-CODEX-01

Base:
- exact Work0050 branch head

Branch:
- `codex/0051-backend-daily-backup`

Draft PR base:
- `codex/0050-theme-color-tool`

Implement:
- Backend Spreadsheet only daily snapshot
- dedicated backup folder contract
- daily idempotency
- >30 day move-to-Trash retention
- daily trigger architecture
- setup / installer integration
- recovery documentation
- deterministic Drive / trigger adapter tests

No real Drive backup folder/file creation.
No real trigger creation.
No live deployment.

### Stage 3 — Work0052 / Dispatch 0052-CODEX-01

Base:
- exact Work0051 branch head

Branch:
- `codex/0052-missing-source-graceful-failure`

Draft PR base:
- `codex/0051-backend-daily-backup`

Implement:
- Meeting Docs / Pitchbook原本 missing/inaccessible時のpage-inline safe error
- cited-source-only Drive validation
- stale provider citationを表示しない
- no popup
- no Backend mutation
- no auto recreate/deactivate/index delete
- natural Japanese wording

No provider calls.
No real source deletion.
No live deployment.

### Stage 4 — Work0053 / Dispatch 0053-CODEX-01

Base:
- exact Work0052 branch head

Branch:
- `codex/0053-japanese-copy-brand`

Draft PR base:
- `codex/0052-missing-source-graceful-failure`

Implement:
- user-facing Japanese copy naturalization
- wording consistency sweep
- brand -> `Private Assets Intelligence`
- remove `Knowledge Share`
- remove `Knowledge Sharing Platforms` visible product title
- remove `PRIVATE ASSETS KNOWLEDGE`
- internal identifiers remain unchanged
- include new Work0052 error copy in wording review

No live deployment.

## Dispatch discipline

Each Stage owns one Dispatch ID:
- 0050-CODEX-01
- 0051-CODEX-01
- 0052-CODEX-01
- 0053-CODEX-01

For each Work:
- create/update `docs/handoffs/<WORK_ID>-dispatches.md`
- create the Work-specific report
- keep Work status as RETURNED_PENDING_REVIEW or equivalent RETURNED, never ACCEPTED
- Completion Latch remains NOT_APPLIED
- BALL returns to CHATGPT in final report

Do not reuse a Dispatch ID.

## Stacked PR discipline

PRs remain Draft and unmerged.

Expected stack:

```text
main (Work0049 ACCEPTED)
  <- PR0050 / branch0050
       <- PR0051 / branch0051
            <- PR0052 / branch0052
                 <- PR0053 / branch0053
```

Do not retarget PRs to main during overnight run.

Do not squash/rebase earlier branch history after a downstream stage has started unless required to resolve a blocking conflict; if so, stop and report BLOCKED rather than rewriting the stack silently.

## Stage gate

After each stage:
- focused tests PASS
- `npm run check` PASS
- bundle regeneration / `npm run check:bundle` PASS
- `git diff --check` PASS
- deterministic browser tests required by that Work PASS
- no out-of-scope backend/schema/provider/permission changes

If any stage has a material failure:
- stop the batch
- do not begin later stages
- preserve completed earlier Draft PRs
- return BLOCKED with the cheapest decisive next action

No “fix forward” across Work boundaries.

## Live-mutation prohibition for overnight batch

```text
MERGE: 0
APPS_SCRIPT_SOURCE_SYNC: 0
IMMUTABLE_VERSION_CREATE: 0
DEPLOYMENT_UPDATE: 0
NEW_DEPLOYMENT: 0
REAL_BACKUP_FOLDER_CREATE: 0
REAL_BACKUP_FILE_CREATE: 0
REAL_TRIGGER_CREATE: 0
REAL_RETENTION_TRASH: 0
PROVIDER_CALLS: 0
REAL_MEETING_MUTATION: 0
REAL_PITCHBOOK_MUTATION: 0
REAL_MASTER_MUTATION: 0
PERMISSION_CHANGE: 0
PUBLIC_EXPOSURE: 0
WORK_0030: DEFERRED_BY_USER
```

## Morning review

CHATGPT reviews in order:
1. 0050
2. 0051
3. 0052
4. 0053

For each:
- review exact diff/report/tests
- merge accepted upstream PR
- rebase/retarget next stacked PR as needed
- perform only the required bounded runtime qualification / deployment
- apply Completion Latch
- proceed to next Work

If an upstream Work requires repair, downstream stacked PRs remain provisional until reconciled.
