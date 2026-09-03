# Company installation from the Knowledge Share bundle

Status: Target operator flow for Work `0023`; implementation and screenshots pending

Audience: non-specialist company administrator

## What you need

```text
KnowledgeShare.bundle.gs
release-manifest.json or the release checksum page
this installation guide
permission to create files/folders in the target Shared Drive folder
permission to deploy an Apps Script Web App for the intended company users
```

No personal Google Drive template, Git, Node.js, terminal, `clasp`, source repository checkout, raw resource IDs, JSON editing, or manual creation of multiple script files is required.

Use only the bundle and release manifest from the same accepted release. Do not use a copied bundle whose origin or checksum is unknown.

## Target installation flow

### 1. Create the host Spreadsheet

In the Shared Drive folder where Knowledge Share should be installed, create one new Google Spreadsheet.

Recommended name:

```text
Knowledge Share Control
```

Keep the Spreadsheet in that folder while installation runs. The installer uses its parent folder as the default location boundary.

Run the first installation using the company administrator account that will own or administer the Web App. The installer requires an identified, unambiguous active user and records that user as the initial administrator.

### 2. Open Apps Script

From the Spreadsheet:

```text
拡張機能 -> Apps Script
```

### 3. Enable Drive API only when required

If the accepted release guide says `Drive API service required`:

```text
Editor left panel -> Services + -> Drive API -> Add
```

This is required by the current Shared Drive implementation. Do not enable unrelated services.

A future release may remove this step only after equivalent Shared Drive behavior is qualified without the Advanced Drive service.

### 4. Verify and paste one bundle

Confirm that the bundle belongs to the same release/source commit as `release-manifest.json`. Use the published final-file SHA-256 check where company policy or the release process provides it.

Open the default code file, remove its sample content, and paste the complete contents of:

```text
KnowledgeShare.bundle.gs
```

Save once. Confirm that Apps Script accepts the exact file and shows all three guarded operator functions in the function list:

```text
installKnowledgeShare
checkKnowledgeShareReadiness
confirmKnowledgeShareDeploymentSecurity
```

Do not split the bundle into multiple files, edit generated sections, or replace only part of an older bundle.

### 5. Run the installer

Choose:

```text
installKnowledgeShare
```

and press Run once.

The installer is not a normal product function. It performs server-side administrator/identity checks before any mutation. An unidentified or unauthorized account must stop with an action message rather than continuing.

### 6. Approve Google permissions

Review and approve the Google authorization request for the installing company account.

The release guide lists the expected services/scopes. Stop if the authorization request contains an unexpected product, Gmail permission, or materially broader permission than the approved release contract.

### 7. Read the installation status

Return to the host Spreadsheet and open:

```text
KnowledgeShare_Installation
```

Expected first successful state:

```text
READY_FOR_DEPLOYMENT
```

The sheet shows the next action in plain language. Normal installation does not require reading execution logs or raw JSON.

### 8. Create the Web App deployment

In Apps Script:

```text
デプロイ -> 新しいデプロイ -> ウェブアプリ
```

Use the company-approved settings. The expected default is:

```text
Execute as: deploying administrator
Access: company/domain users only
```

Do not select public/anonymous access unless separately authorized.

Copy the resulting Web App URL.

### 9. Confirm final readiness

Before reporting or sharing the Web App as ready, manually re-open the deployment settings and verify both:

```text
Execute as: deploying administrator
Access: approved company/domain users only
```

Then run the guarded administrator attestation:

```text
confirmKnowledgeShareDeploymentSecurity
```

This records only a timestamp and a hash bound to the current Web App URL/deployment identity. It does not store credentials or claim that Apps Script exposed the deployment settings through an API.

Finally run:

```text
checkKnowledgeShareReadiness
```

Expected state:

```text
READY
```

`READY` is valid only after the deployment, required services/permissions, and the administrator's explicit deployment-security attestation are observed. A Web App URL or source/bundle syntax pass alone is not readiness. A changed Web App URL invalidates the prior attestation. Any later manual change to execute-as or access settings requires running `confirmKnowledgeShareDeploymentSecurity` again even when the URL does not change, because the ordinary runtime cannot independently inspect both settings.

### 10. Share the Web App URL

Share the Web App URL with approved internal users. Users do not need the bundle, Apps Script editor, Backend Spreadsheet, Audit Spreadsheet, or release manifest.

## Expected default Drive structure

```text
Selected Shared Drive folder
├─ Knowledge Share Control
├─ Private Assets Knowledge
│  ├─ Meeting Records
│  └─ Pitchbooks
├─ Knowledge Exports
├─ Knowledge Platform Backend
└─ Knowledge Platform Audit
```

The exact host Spreadsheet name may differ. Stored resource IDs remain authoritative after installation.

## What the installer handles

- verify Spreadsheet-bound context and installer authorization;
- create or reuse required folders;
- create or reuse Backend/Audit Spreadsheets;
- create and validate required sheets/columns;
- insert missing Master and Setting rows;
- record application/schema/source/profile/payload-hash versions;
- avoid duplicate resources;
- create only explicitly enabled mandatory triggers;
- run readiness checks;
- require an administrator-confirmed, deployment-identity-bound security attestation before `READY`;
- support rerun for repair or upgrade;
- return safe, plain-language actions without exposing private IDs.

AI providers and recurring AI synchronization remain disabled until an administrator configures them separately.

## What is intentionally not created

- Gmail labels or Gmail scopes;
- public access;
- recurring AI triggers by default;
- personal Drive templates;
- production API keys;
- provider Stores before provider setup;
- a second Web App or Library deployment.

## Rerun and repair

It is safe for an authorized administrator to run:

```text
installKnowledgeShare
```

again after an interrupted installation or bundle upgrade.

The installer reuses stored resources, migrates append-only schema changes, and avoids duplicates. It stops rather than guessing when identity, authorization, service availability, or resource matching is ambiguous.

Normal product users must not be able to use a browser console or crafted `google.script.run` call to perform installation or repair mutations.

## Simple failure messages

The installation sheet should translate technical failures into one action, for example:

```text
Drive APIを追加してください
導入先スプレッドシートを共有ドライブ内に置いてください
会社管理者アカウントで再実行してください
権限を確認して再実行してください
同名ファイルが複数あります。管理者に確認してください
Web Appを1回デプロイしてください
デプロイ設定を確認して confirmKnowledgeShareDeploymentSecurity を実行してください
配布ファイルのrelease/hashが一致しません
```

Technical details may be available in a collapsed support section, but are not required for normal use.

## Separate control-folder option

If company policy requires Backend/Audit files to live in a separate restricted folder, use the advanced installer option and paste folder URLs. Raw folder IDs are not required.

The normal one-folder installation remains the low-friction default; final production qualification confirms the actual permission boundary.

## Upgrade target

For a later release:

```text
verify the new release manifest/checksum
-> replace the old code with the complete new bundle
-> save and run installKnowledgeShare again as an authorized administrator
-> review readiness
-> create/update the Web App version as instructed
-> manually verify execute-as and company/domain access restrictions
-> run confirmKnowledgeShareDeploymentSecurity and then checkKnowledgeShareReadiness
```

No manual schema, seed, trigger, or resource editing should be required.
