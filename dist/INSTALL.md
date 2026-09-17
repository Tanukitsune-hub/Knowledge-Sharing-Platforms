# Knowledge Share 0.1.2 installation

Source commit: `998c9d1f85e6e160db59f85434068b3b23bec0dc`
Bundle SHA-256: `9e3ec936b662912f6599a2164b9a7d364aafba4c0bc3dc26de332d605a48f305`
Payload SHA-256: `2dff71955226887064b2f7aa416626da42f5750c65fccadfd9a5804af55703e2`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
