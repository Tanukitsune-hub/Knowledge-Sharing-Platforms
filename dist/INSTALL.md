# Alternative Assets Intelligence 0.2.4 installation

Source commit: `c73bb15d8566542ab598e3978869fea592a87a25`
Bundle SHA-256: `01e3d541d536a0c68cc94405f1454f57c28e2d4db6c99e9949a9743e9ab9e464`
Payload SHA-256: `0d054b37f69426e2f9102811b36c65322ef90d30d5a130fbf4a6a4eace27b342`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
