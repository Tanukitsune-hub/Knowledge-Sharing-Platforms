# Knowledge Share 0.1.2 installation

Source commit: `420b871bbe60315092517421350da5b871ed1f2e`
Bundle SHA-256: `6c5ff7dfdd411ba918ff98e51c0234f6ad1781341ca1cc4ac5dc036d07eaf14b`
Payload SHA-256: `812cb338934f25fd82f3d9673b4375575329daf2f5e4dfaf678517af1fa18ebe`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
