# Knowledge Share 0.1.2 installation

Source commit: `5842a07255a10415d39d524fd8ec174450248855`
Bundle SHA-256: `4442a8c39955820c34e01290d82a0c97843b88482c8ccf7fa077d364edd5d0c0`
Payload SHA-256: `28c4e7c5ba1f4f344a61be990cf94ffbe890dc8276a386e43ea1065502a06e3c`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
