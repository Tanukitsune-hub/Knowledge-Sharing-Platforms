# Knowledge Share 0.1.2 installation

Source commit: `3383735556ca7678d64c45c5f948b3ae1bfb7e00`
Bundle SHA-256: `70f071efd9752ac2b564df2105cc50e161150062e56022fddb9b72e1509211fb`
Payload SHA-256: `911f8533ee0fac4227ab313e24b3b9abe41ccc5a3a116d8fb0a166984445a6ae`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
