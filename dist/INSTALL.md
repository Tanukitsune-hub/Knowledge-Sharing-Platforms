# Private Assets Intelligence 0.1.2 installation

Source commit: `3fd63b033a23fc192d1b7f2a3cbab9aad09f122e`
Bundle SHA-256: `0566b4c08d3fb7b2c9aefcfcfa69e9eeda5b229171f167478f049ee7040e6e8e`
Payload SHA-256: `d0ec39a7d1c244bd73af4b3e869888c790bfd13dec7a54eb7a970737391f2a70`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
