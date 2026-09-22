# Private Assets Intelligence 0.1.2 installation

Source commit: `369fa4829dfe148d4807705de754c65b102901c3`
Bundle SHA-256: `c0d803dc4e34c6f396e6cec24bd4fceb84ce7fb9a01636cc9515b1757a842ad5`
Payload SHA-256: `cbd803fad74ac1cdc7a7235649d3cd6751643d7955b0a1fd82443b26f0cffd62`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
