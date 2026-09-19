# Knowledge Share 0.1.2 installation

Source commit: `e5d0a75baa04598289ab11ac16d74da42c536f67`
Bundle SHA-256: `08a4192198769b98cba90a214185f9a623d757a6fba2684d46a214577d53388e`
Payload SHA-256: `7b4abe1c9ed9951435cb5ab435541df4a374c4c100faa09aa7885ff8b7862b21`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
