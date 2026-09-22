# Knowledge Share 0.1.2 installation

Source commit: `72aae62e46f8f8d8faa3ead75eacd9ba1af1eb18`
Bundle SHA-256: `dc08b3507c2b355ea5836891bd38849a52a3034cd14d02d579e84cba4d1792f9`
Payload SHA-256: `a0d284b7aeb2f667c0e93da09aa476529c095f278800bd6e56e250d831502da6`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
