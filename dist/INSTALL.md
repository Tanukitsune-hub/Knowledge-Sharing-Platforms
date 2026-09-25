# Alternative Assets Intelligence 0.2.0 installation

Source commit: `61d5abdb7fe95616a5a0ae3519910c429d4ebb3b`
Bundle SHA-256: `f7f445e78fa0d88231bba655edfc5651e6ebc88a26f8a8d26ec6aa4cdfda16e4`
Payload SHA-256: `7672bf887749a31cd3555a86a8a2d1ddade6eada76da79ed77a3db1b26f8856a`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
