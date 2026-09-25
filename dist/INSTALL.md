# Alternative Assets Intelligence 0.2.1 installation

Source commit: `5519a8af66617196aff640a65b9a8168ad8a172f`
Bundle SHA-256: `681600c6b1494edc4e67616c25405edb59a46f9960a44f84e81d97d5e3158da5`
Payload SHA-256: `316b3348d96f86869aba0808efba59ef8b69725a053c418d7fe8966c5eb1f622`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
