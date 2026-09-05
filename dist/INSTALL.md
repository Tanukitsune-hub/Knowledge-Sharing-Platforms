# Knowledge Share 0.1.2 installation

Source commit: `9fa668619a0b91fb60ed53f696363d3954cf709e`
Bundle SHA-256: `189715c6089f0f16026b1f37069483795ba6ff916c9521be83a4e48e2701357a`
Payload SHA-256: `58ee92b699c1820c4f2894a9b1d4ea3430302fb8bd3648c9eb66b8f50b24b237`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
