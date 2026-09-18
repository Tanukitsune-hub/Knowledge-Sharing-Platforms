# CODEX-01 — Production Meeting layout and sidebar refresh instruction

WORK_ID: 0034
DISPATCH_ID: 0034-CODEX-01
BALL: CODEX
STATUS: IN_PROGRESS
MODE: BUILD

## Primary Outcome

Work 0033で受理済みのMeeting-create current candidateをproduction Web Appへ忠実に反映し、shared left sidebarをpremium metallic gold / dimensional icon / visible ornament方向へ更新する。actual owner-only versioned Web Appでresponsive layout、通常操作、console healthまで認定する。

## Acceptance Evidence and Hierarchy

1. actual owner-only versioned `/exec`のrendered DOM、computed layout、通常navigation/registration readback、console。
2. authoritative Apps Script target/deployment metadataとsaved/versioned/served source parity。
3. focused UI tests、`npm run check`、bundle parity、`git diff --check`。
4. source inspection。

## Sources of Truth and Closed Conclusions

- Base ref: `origin/main@1c8cb9303cd1d51fe2873076a49dd6d743f7d318`。
- `docs/handoffs/0033-completion-report.md`
- `docs/handoffs/0033-user-layout-candidate-current.json`
- `docs/handoffs/0033-dispatches.md`
- `docs/decisions/ui-layout-lab.md`
- `docs/planning/work0033-ui-layout-lab.md`
- Work 0033のLayout Lab v2、current candidate、USER browser qualificationはaccepted evidenceであり再設計しない。
- Production baselineはWork 0032 owner-only Web App version8。Work 0033はproduction source/deploymentを変更していない。

## Required Scope

### Meeting-create

- 12 columns、width 100%、max-width 2000px、left aligned、14px / 14px gap。
- Desktop Wide / Laptop / Compactで次のcanonical topologyを維持する。
  - Row 1: Date `1/2`、Time `3/1`、Location `4/2`、Team `6/2`、Asset Class `8/2`。
  - Row 2: Meeting Type `1/12`。
  - Row 3: Counterparty `1/6`、Fund / Strategy `7/4`。
  - Row 4: external participant `1/6`。
  - Row 5: internal participant `1/6`。
  - Row 6: attachment `1/12`。
  - Row 7: notes `1/12`。
- `meeting-capitalTypeId`はDOM/backend contractを保持したままvisible grid spaceを消費しない。
- 720px以下だけ1-column visual projectionとし、desktop placementをreorder/reflowしない。

### Shared sidebar

- muted flat beigeではなくpremium metallic goldを明確なvisual identityとして使用する。
- bright highlight / deep gold shadow / layered gradientを使い、active itemをraised、hover/inactiveもdimensionalにする。
- iconへbevel相当のinner highlight、soft shadow、layered gold treatmentを加える。
- bottom-left ornamentのopacity、contrast、layer separationを上げ、decorative motifを維持する。
- Light UI baseline、navigation semantics、page behaviorを維持する。

## Non-Goals

- Past Meetings等、他tab本文の大規模layout redesign。
- schema、migration、backend data model、security、provider behaviorの変更。
- Work 0030の再開。
- new target、second deployment、permission broadening、real/confidential data、physical delete。

## Target Runtime, Test Data, and Side Effects

- `TARGET_RUNTIME`: same existing organization-controlled Apps Script project / same single owner-only versioned Web App / deploying-owner browser。
- `ISOLATED_TEST_DATA`: existing synthetic runtime dataset。必要なregistration/readbackもsynthetic recordだけを使用する。
- `SIDE_EFFECT_STATE`: provider calls0、AI sync unchanged/disabled、confidential data0、physical delete0、public exposure0、permission broadening0。
- `STAGING_DECISION`: separate staging targetは作らない。同じisolated targetが必要なnative evidenceを提供する。

## Authorization and Mutation Boundary

- Allowed: scoped production HTML/CSS/client layout source、focused tests、canonical bundle、same existing target source/manifest sync、immutable version、same existing WEB_APP update。
- Remote mutation前にGit ref → authenticated target identity → remote saved source → current immutable version → existing WEB_APP `/exec` → execute-as/accessを別々にread-only確認する。
- Existing targetとexisting single owner-only deploymentだけを使用する。deployment ID、URL、account、Script ID等はreport/chatへ記載しない。
- Maximum: coherent repair/runtime cycles `3`。各cycleにつきsource sync `1`、immutable version `1`、same deployment update `1`まで。new target `0`、second deployment `0`。
- Same failure classが連続、identity/security drift、evidence contamination、provider/real-data requirementが出た場合はStrategy Resetして安全停止する。

## Required Validation

### Logic Validation

- authoritative candidateとのexact placement contract。
- DOM/source orderに依存しないdesktop placementとmobile-only projection。
- hidden capital fieldのcontract preservation / visible space0。
- sidebar metallic layers、active/hover/inactive dimensional states、motif visibility。
- focused tests、`npm run check`、canonical bundle regeneration、`npm run check:bundle`、`git diff --check`。

### Target-Runtime Qualification

- Wide 2560 equivalent、Laptop 1440、Compact 1280でsame topology。
- Mobile 390で1-column / horizontal overflow0。
- synthetic Meeting registration/readback regressionなし。
- sidebar gold presence、dimensional icons、active/hover differentiation、bottom ornament visibility。
- page non-blank、navigation、framework overlay0、console material error/warn0。

## Delivery

- Branch: `codex/0034-production-layout-sidebar-refresh`
- Create one Draft PR; do not merge。
- Report: `docs/handoffs/0034-CODEX-01-production-layout-sidebar-refresh-report.md`
- Dispatch register: `docs/handoffs/0034-dispatches.md`

## Completion Latch

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
PROVIDER_CALLS: 0
AI_SYNC: DISABLED_OR_UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

WORK_ID: 0034
DISPATCH_ID: 0034-CODEX-01
BALL: CODEX
STATUS: IN_PROGRESS
