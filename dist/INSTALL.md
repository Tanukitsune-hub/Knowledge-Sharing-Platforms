# Knowledge Share 0.1.2 installation

Source commit: `e518df9ebf1a5ae8de04bd396b0dbc83e0c0aaa5`
Bundle SHA-256: `f055b57c19b62be3fa5c9a52bfcc9f717c31781511d624d45df08740af396ce2`
Payload SHA-256: `38248485700accc7119f377cc3af4def66fc5b7b3ffd8929bad8bebb0ca4d2a7`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
