# Knowledge Share 0.1.2 installation

Source commit: `6b1f180b68f70527fad42a37b774f198531c473c`
Bundle SHA-256: `e2b75c8881bcfcda5a3e88b4268f029868dcf13b2ac587c912332ee382a9f277`
Payload SHA-256: `d0220108381171674f549ac08b826b6d4bb9c650d67e5506d77c62c431af4b74`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
