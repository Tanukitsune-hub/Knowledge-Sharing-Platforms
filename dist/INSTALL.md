# Knowledge Share 0.1.2 installation

Source commit: `5a858934f6b919751720225f0fdbd55f1a1d9983`
Bundle SHA-256: `5c53b811fb84be249cf0d5e557a3728e5f92e1ef1393ef20e45103796a4089b2`
Payload SHA-256: `97e8640e91a3d8e6b211ee8a4c94f8a0a2944042d93b4b2e677dfb58354c56cc`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
