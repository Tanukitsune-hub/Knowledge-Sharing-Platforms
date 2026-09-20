# Knowledge Share 0.1.2 installation

Source commit: `aecf175617cb5898fec609e490152de07cc4d7f2`
Bundle SHA-256: `28d5a94cfa26ebd4738adde8d236145f816747ad53cf427852edcee05173c8de`
Payload SHA-256: `58ef384e074ca099ebf1485b297308a44308cb556486a63b3f658b1465b51890`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
