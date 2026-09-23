# Knowledge Share 0.1.2 installation

Source commit: `39c6bbb368af183e92bf7a7a4a1897f785e728a3`
Bundle SHA-256: `abb903cdd93c57001c847e993f2310a10920305c9aee151864f9221ebc98448d`
Payload SHA-256: `613d34a1b8a39a4742964db88312f2f79f30c5a829cca933972f6c6efe3fe772`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
