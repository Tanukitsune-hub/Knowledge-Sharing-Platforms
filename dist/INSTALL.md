# Knowledge Share 0.1.2 installation

Source commit: `84eae0bf15b0d5b2144c94b08a33aa4c5c035574`
Bundle SHA-256: `83d77202a1ce7112de696c6bb6c0595f7c128bc9d704199e8de343ba3d74de12`
Payload SHA-256: `2589f06e0dea4d9cd97b0e315f7aef6770e0c48d5a982bc3ac5c8c26f660d6f2`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
