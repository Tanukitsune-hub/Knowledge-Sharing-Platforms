# Knowledge Share 0.1.2 installation

Source commit: `1869d9b12fbef3d77cd8ce876883d3c21a850889`
Bundle SHA-256: `be5c9c3535c0b5cfe89e69d613953553c9197b78c83e552db0d389efd571d3de`
Payload SHA-256: `5ffaa2e59bff115f78a18bc6d789b60c749c88edb0373e1c93e4e631f0346eac`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
