# Knowledge Share 0.1.2 installation

Source commit: `a25da677990585a405cbd5029d12f0355fecfa72`
Bundle SHA-256: `0bc3f8c9086ff9332e75de726c390f1023b38f349f0f2e5e011c37c6e65b799d`
Payload SHA-256: `852c782ea177207cc2621cc707a7f75cfd392d8c536e9ccd3871bfc7a9098b02`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
