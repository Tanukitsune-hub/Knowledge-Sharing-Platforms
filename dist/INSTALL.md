# Knowledge Share 0.1.2 installation

Source commit: `b3556585bd4e9240793ee04a6a5f5f9d6e679561`
Bundle SHA-256: `d8c2a98ccd746b3f6575f266ee5291b02238b0bade4694f2a47aa4926d87e989`
Payload SHA-256: `6ef11efb03eaff657750c74f919d42fe92447139e718cade6179e2a5110c4127`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
