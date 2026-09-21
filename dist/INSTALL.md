# Knowledge Share 0.1.2 installation

Source commit: `a9dfedfb1dd2c8f1fb75f92b8f43251d36816a11`
Bundle SHA-256: `1afe3e0949696e4450b4e962f8cf638fd550a7cf7551c5a56f3e6d2dc604eaeb`
Payload SHA-256: `99405e86a0e8b62f7d6c79599437a117e325e505023d6a32c0adc2ff528e6c27`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
