# Alternative Assets Intelligence 0.2.3 installation

Source commit: `32f120eca8b1d94822c00762e59f4b202a7f1465`
Bundle SHA-256: `60799e8afef33f29477a02924e40121fb384b522c7564029ffcb13dc1baf38fc`
Payload SHA-256: `009e99f3dab080ff3cc0a6c589f4823bb8c3a22731f35ea82a978c58b1e051c6`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
