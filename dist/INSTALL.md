# Knowledge Share 0.1.2 installation

Source commit: `65bf3f0970369496843b9bf5ce04a05317231204`
Bundle SHA-256: `1a7fe998164593178d37d1d0ebef635ee5f7251bb026086d4e43122319182d6b`
Payload SHA-256: `1924cd8d2e2a2f6af81626b3e20b9ea7684d8d209f8a7f2f9ed96ae427033f02`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
