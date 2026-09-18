# Knowledge Share 0.1.2 installation

Source commit: `1c8cb9303cd1d51fe2873076a49dd6d743f7d318`
Bundle SHA-256: `e642e1527bd3963b28b6697e47706a60d78abf099de6f7da68fcee6bc3a9387d`
Payload SHA-256: `5bc1f8933af64deff509d6da9204d39e2bc2049e2cfaca8afe736238a6968e3a`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
