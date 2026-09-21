# Knowledge Share 0.1.2 installation

Source commit: `1dffc35255162c44f40bda950fa7c1efc0527711`
Bundle SHA-256: `f7b8011988334b192b50fd262a3bbbc3109f01e9b8a88f1bd3710e5e83f5d885`
Payload SHA-256: `f357ddfd6e3300aa093d48813ee646289d8f386731b422065291339e373f9edb`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
