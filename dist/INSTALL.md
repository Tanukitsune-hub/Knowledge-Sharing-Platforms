# Alternative Assets Intelligence 0.2.0 installation

Source commit: `d54837074c1061bd11cafb8c126bf0373f682ffa`
Bundle SHA-256: `ca115698cc3e70885d621f9229ac89b3befa6c21f570a39b55b198d4ef1fe10a`
Payload SHA-256: `9904edfb00b954ff4f7d861d0e39b5aa19730758e7eb4916273c942e43c0c515`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
