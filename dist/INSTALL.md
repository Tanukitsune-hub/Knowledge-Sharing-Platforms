# Knowledge Share 0.1.2 installation

Source commit: `1dcc25b200de587958d44d91bc919ca2c90d9c9c`
Bundle SHA-256: `06bca853459e0ccca2cdb6b40fe1db18c0ae6e93ac8e47ed9751ff873d58e336`
Payload SHA-256: `ca3ddc63e6fefd436d86bf9507684a3200daa65923a128531043a86ecf2011e5`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
