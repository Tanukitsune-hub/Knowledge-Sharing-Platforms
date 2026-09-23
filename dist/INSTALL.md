# Private Assets Intelligence 0.1.2 installation

Source commit: `da4d3601ab3dc7a08853027fbddd597f39db3ea3`
Bundle SHA-256: `3e7d7afdb8b7ed6f582be0c4a0c1e747ee59f5db852ade17c1c7516fc9c165b6`
Payload SHA-256: `24b6ed6b995b1720d7f8c6781e7e4db3a8a8167dd42b55fc5b9a7467a3a8c863`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
