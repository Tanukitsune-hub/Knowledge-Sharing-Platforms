# Knowledge Share 0.1.2 installation

Source commit: `7fccd826706de2ef7337eed34af8e4260a551d8f`
Bundle SHA-256: `f0cfd52917577e5ef27ee73bfef1b7995dff435ca2e428acde60d0fbb7f52211`
Payload SHA-256: `2f205a38ba4f684d681888842febb84d01d27128ad0551e7c21910d542e18931`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
