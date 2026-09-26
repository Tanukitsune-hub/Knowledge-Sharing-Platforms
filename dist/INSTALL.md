# Alternative Assets Intelligence 0.2.2 installation

Source commit: `55bac220d4ea25d2c9f965fd0e8d504f0a0128f6`
Bundle SHA-256: `02758480684b5e985182270fc73705b75b29592bef990ebfb4821beee79cc406`
Payload SHA-256: `082d25b097ad1bbc9a6071040e58d2cfc4fac9abcf649630a8d810a92b309415`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
