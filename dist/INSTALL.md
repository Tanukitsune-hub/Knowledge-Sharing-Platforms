# Knowledge Share 0.1.2 installation

Source commit: `aa55bbac75a3b97c58df513d2c0465a2c7fde505`
Bundle SHA-256: `c1b1496ac32c54c21255a38b9ea957809ceffdd473d5bf6781b2450c1d2bf6a2`
Payload SHA-256: `80031853af5eafc1e3e48008459d77f82d13a47163f7f5c8d043d40210afbb62`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
