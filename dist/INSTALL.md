# Knowledge Share 0.1.2 installation

Source commit: `fdb3fb3c42aea77d96857587d7405c8fdfde506c`
Bundle SHA-256: `9fe6607d794b7bdd502de221422e338b665a365b50a457e56618c55857f88f88`
Payload SHA-256: `fce7c5951c9b65ca4498dc07528c386af0c495bfe61dfaa2eb7255b633a23cea`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
