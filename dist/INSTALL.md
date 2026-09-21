# Knowledge Share 0.1.2 installation

Source commit: `013162ec6de5e0449a717593909d75dc67872f61`
Bundle SHA-256: `72e7a8d8613ce11fedfda8eda71e94bf22ec57e060de7b7938c3b0ac530d2827`
Payload SHA-256: `af42717ee86b6e13f1699670766c3b6495577b224a946afefde365a2ea3388bf`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
