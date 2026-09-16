# Knowledge Share 0.1.2 installation

Source commit: `cc135b49702fb04207de39b0cf529125a994172e`
Bundle SHA-256: `8540c57ae14798e581f7cc4bce4a86179a2ae9e8d6c2bfaf9388fbb1ea7eb378`
Payload SHA-256: `8830b607496c3477f133ca223a3bb35e91954179286b78144941cd372f4b51f6`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
