# Private Assets Intelligence 0.1.2 installation

Source commit: `4f092183d6f5804b79b5ef802c40b234aedd6131`
Bundle SHA-256: `8ef7c362af8c5da23c792cf20046c8b6f08a044f16fa5b71e3d40f7f46601c27`
Payload SHA-256: `4f307fe4717c3190349f5d80ab0c01126ed39cd3f38c0f1b4ce41607163da690`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
