# Private Assets Intelligence 0.1.2 installation

Source commit: `7358d7970b65d133702addf466006950fdd3dfc0`
Bundle SHA-256: `dd92b3aff9fa0a1a5eaca522bddaddbc74f89be4a836f122c84ccce80dbd8685`
Payload SHA-256: `e1881327e03d657c385b411298b0d5574022c56558da36c463a86319b5f1c06d`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
