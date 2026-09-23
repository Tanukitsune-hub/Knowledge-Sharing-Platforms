# Knowledge Share 0.1.2 installation

Source commit: `76ac49b2d053b380f9a088021df9ff7809dc0973`
Bundle SHA-256: `dbc7f4d83826b973f6cf9dd6d453796b8e607acc883879c6bd4449ed29c20b1a`
Payload SHA-256: `fdcb8eb9be5792a94adbcdfc68ea48d381eeac93bd07679cf1b615a6aa256305`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
