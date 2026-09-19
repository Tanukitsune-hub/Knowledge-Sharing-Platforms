# Knowledge Share 0.1.2 installation

Source commit: `fb358fffa328a21f574c7002bc5cb3db7f7b506e`
Bundle SHA-256: `0b5379ce842460260a4dfa3b2e4542622ef07c342329c29a9c4d9bab014118de`
Payload SHA-256: `db55ab44e2fffa8c64fd4a0051dd899641c3e209d467bf668dc39a29d633b200`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
