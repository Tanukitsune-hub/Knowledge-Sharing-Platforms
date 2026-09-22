# Knowledge Share 0.1.2 installation

Source commit: `817ed3f3f871c5f313c928ee1c5102da26fc74e0`
Bundle SHA-256: `d2afac4fdc7a4d74dd59054ae1fec4a7fc30b1d369f0b2e5bf749096a2d80d49`
Payload SHA-256: `35cc3210fcc75753393934f7dd885131f277ee65ac7b9f753cbdfa23dc214d28`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
