# Knowledge Share 0.1.2 installation

Source commit: `af96c145e999ac7bed9d7aa4862e41b87ad17c82`
Bundle SHA-256: `b3cd47170ad277760a096bf6bd96b4d33d67a01f582cddc884ff6a52ff28bcec`
Payload SHA-256: `902b3e604afa37af68d2396a829e95cb81c8a5f795b4e2c587cd5efb5f6cd79e`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
