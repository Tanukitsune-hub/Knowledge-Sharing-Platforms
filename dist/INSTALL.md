# Knowledge Share 0.1.2 installation

Source commit: `8d8a6fd66a998c0d1c167c4421ede46af9edbdb7`
Bundle SHA-256: `46f206bab524f606bb2ee8a2b334a9726d02967d9a5c5e44e79da8f1d8a3ee68`
Payload SHA-256: `fee2d4a6f0c0a2928df5179fee9c4e2aa70a00284e126259c993f6122e51295f`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
