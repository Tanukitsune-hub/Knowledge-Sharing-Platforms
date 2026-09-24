# Private Assets Intelligence 0.1.2 installation

Source commit: `7971d0eaaf08d6eb35b60e8d3c8a0e9f61a491e0`
Bundle SHA-256: `0039de728f2a67876c8e802c5e77d3de0dff876c78d046009079ba44f810b62f`
Payload SHA-256: `b88f28ee5e7ec6dd88acd200e5dbb471af513e7e3f112c01d442c5957646cfa3`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
