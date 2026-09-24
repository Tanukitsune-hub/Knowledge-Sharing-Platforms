# Private Assets Intelligence 0.1.2 installation

Source commit: `626699b87c4da1131d4314273b08f65e6ed9b449`
Bundle SHA-256: `b9e1d04911d84a965b187e0dd33bdb717b4a10b397b4e8a6dc24e5fd8b2ec69c`
Payload SHA-256: `c3c1ec8a8c0f9791f04c8ea9aea736c0aaa72bd90ce7be22877337bfeb28a601`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
