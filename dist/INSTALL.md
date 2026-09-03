# Knowledge Share 0.1.2 installation

Source commit: `b498c78b6c29cc6acd49f2fcb640b57d868e6727`
Bundle SHA-256: `c24ac9d817f7ebe48f3e5c6e744aae94adc3272fcd5bcb2d49cc935ad7060f3d`
Payload SHA-256: `f11d0737489125139521f50e7911c945b029c15ee0922a462ca1e712fa31eeeb`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
