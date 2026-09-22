# Knowledge Share 0.1.2 installation

Source commit: `1339542022791d41a318753606ae9e426c0d02a7`
Bundle SHA-256: `0abf936f6bd87c573b0cf7013fae6a6fce497511101bc2bfc34a23b750853beb`
Payload SHA-256: `25b719d9462970905f7871fcb70b775fe5f2ae9315624750875282154ed2330b`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
