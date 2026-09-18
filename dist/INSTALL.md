# Knowledge Share 0.1.2 installation

Source commit: `f6bbfdf3e68834dc5b6bee7bdc262b16169f8a8b`
Bundle SHA-256: `2f13bba0e2e21908b7a77b13e4d0f04f1297bc9e84c08526a2f9a258b2bcc5f2`
Payload SHA-256: `4676a4d4a4ff8930105357591b66c69e10ac90d50a6f12d742ce8c13c0805251`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
