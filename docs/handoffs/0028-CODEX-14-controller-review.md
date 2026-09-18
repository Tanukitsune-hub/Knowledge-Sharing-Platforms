# CODEX-14 — Controller review

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-14
BALL: CHATGPT
STATUS: REVIEW
MODE: BUILD

## 結論

CODEX-14の停止はapplication defectではなく、用途の異なるinstaller pathを既存standalone targetへ適用したことによるexecution-path mismatchと判断する。

- frozen CODEX-13 sourceは既存Apps Script projectへ1回push済み。
- remote saved source parityは83/83 PASS。
- existing versioned WEB_APP `/exec`はversion 75のまま。
- `checkKnowledgeShareReadiness()`は意図どおりcontainer-bound Spreadsheetを要求し、standalone projectでは`INSTALLER_BOUND_SPREADSHEET_REQUIRED`となった。
- setup/version/deployment/business/provider mutationは0。

CONTROLLER_CLASSIFICATION: EXPECTED_INSTALLER_PRECONDITION / WRONG_OPERATOR_FOR_TARGET
APPLICATION_DEFECT: NO
INSTALLER_DEFECT: NO
MERGE_READY: NO

## なぜinstallerを変更しないか

`docs/decisions/modular-source-single-bundle-distribution.md`は、会社の通常導入を次の形で明示している。

```text
新しいGoogle Spreadsheet
-> container-bound Apps Script
-> installKnowledgeShare()
-> Web App deployment
```

`src/15_Installer.gs`も`SpreadsheetApp.getActiveSpreadsheet()`由来のhost Spreadsheetとその親folderをauthorization/bootstrap/statusの正本として要求する。これはcompany installの安全境界であり、standalone対応のためにguardを緩めない。

Google Apps Script公式でも`getActiveSpreadsheet()`はactive Spreadsheetがなければnullを返し、container-bound scriptが親SpreadsheetをIDなしで参照できる特別なcontextを持つ。

## Existing standalone targetの正しいcontrol path

既存version 75 projectは過去Workから継続利用しているstandalone Apps Script targetであり、fresh company install targetではない。

Repository policyはprivate setup/status/diagnosticをeditor/trigger経路で実行することを認めている。`src/99_EntryPoints.gs`にはstandalone-compatible core operatorが既にある。

```text
getInstallationStatus_()
validateInstallation_()
setupKnowledgePlatform_()
```

これらは`kspCreateAppsScriptEnvironment_()`を使用し、bound Spreadsheetを要求しない。`setupKnowledgePlatform_()`は既存installation state/config/resource IDsを正本としてappend-only schema setup/migrationを行う。

したがって次dispatchではinstaller wrapperを使わず、Apps Script editorから既存private core operatorを直接使う。

## Safety boundary

- `installKnowledgeShare()` / `checkKnowledgeShareReadiness()` / `confirmKnowledgeShareDeploymentSecurity()`は今回使わない。
- installer guardは変更しない。
- public diagnostic wrapperを追加しない。
- Execution API `scripts.run`は使わない。
- existing installation stateが欠落・不整合ならsetupを推測実行せずSTOPする。
- setupはexisting resourcesをreadbackしたうえでappend-only 1回まで。
- AI sync disabled / trigger 0を維持し、provider callは0。
- saved sourceは既にfrozen sourceへpush済みのため再pushしない。

## Next decisive action

Fresh Dispatch `0028-CODEX-15`でPR #51を継続し、次の順序でtarget-runtime qualificationを完了する。

1. standalone editorで`getInstallationStatus_()` / `validateInstallation_()`をread-only観測。
2. existing installation state/config/resourcesのcontinuityを確認。
3. schema 7不足のみなら`setupKnowledgePlatform_()`を1回実行。
4. `validateInstallation_()`を再実行しschema/resource/trigger integrityを確認。
5. immutable versionを1つ作成し、positive proof済みexisting WEB_APPを1回だけ更新。
6. verified `/exec`からR2–R8をsynthetic dataで実行。
7. provider calls 0を維持。

## Accepted evidence retained

- CODEX-13 prepare lifecycle: 160 batch continuity、recent replay、retired-token rejection、INTENT preservation、bounded properties。
- focused 78/78 PASS。
- canonical 515/515 PASS。
- bundle 27/27 PASS。
- CODEX-14 remote saved source parity 83/83 PASS。

これらは重大な反証がない限り再オープンしない。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-14
BALL: CHATGPT
STATUS: REVIEW
