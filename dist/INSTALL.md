# Knowledge Share 0.1.2 installation

Source commit: `a7465fa9090306dd92a35d5f52c329498aca28ec`
Bundle SHA-256: `e56108202b388bddd91ac2ee1018a4a117f32503b35fd35cf8751a8ffff768ab`
Payload SHA-256: `23bde490a23cf238e1f473ffa4c38a4669985437c74bf8bc82eed116004d8e32`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
