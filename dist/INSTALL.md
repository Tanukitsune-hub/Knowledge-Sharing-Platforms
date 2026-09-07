# Knowledge Share 0.1.2 installation

Source commit: `f1c5cb7ae0e98c7ab68b78d5ddf9384caf0f09f7`
Bundle SHA-256: `26dd8ed431f393ca93c0c9fa21a729c55f44976f7a1269fbd69f2c63d9219c3e`
Payload SHA-256: `13155a97bdbf3ec5fa1377925d71e745fa0c20f434130f3d45b1e49f3e8cd5cb`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
