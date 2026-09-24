# Private Assets Intelligence 0.1.2 installation

Source commit: `39d32a2b037bc9c974548679e347f2956d204f7d`
Bundle SHA-256: `f1d626065eedb9d64a096486aef415ce6f10aab6e9b052006ebb66f09bf1a907`
Payload SHA-256: `498dc6713c8f11ccd8dfd5ed12219113bf1ebf6be62537ad76becc47f2d4bcf6`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
