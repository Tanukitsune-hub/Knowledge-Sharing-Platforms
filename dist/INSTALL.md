# Knowledge Share 0.1.2 installation

Source commit: `93e0cbf752649992dfd8b35815118b42f23fb87a`
Bundle SHA-256: `0bf0192a341656ed0b0ce1e7ead85933e1713b784e3fe489ef8f8bd855eea39d`
Payload SHA-256: `487cdf05e7004da5c0060f9b55cd8f66891f9fd886e5a2aabbf4e262de1b3e83`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
