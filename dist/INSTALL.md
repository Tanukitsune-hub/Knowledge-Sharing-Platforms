# Knowledge Share 0.1.2 installation

Source commit: `f8b1487b804eaa0d1cb89184de1a4e169fbd0de7`
Bundle SHA-256: `9d0b244c1128b4afdcbb25df794a8d2647d2cfb194cd1253f18112d8aa14a6ef`
Payload SHA-256: `0923ed61443cbbb3e3e939a4ec1ce55caa0ad1ea6af43f40146e0229927a90b2`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
