# Knowledge Share 0.1.2 installation

Source commit: `c7500549715bf633ec837dfe48798ac25f84a997`
Bundle SHA-256: `e315cc259f406658952db6690db039f569eba08cd6f7d512153f509278eb8dc8`
Payload SHA-256: `5d2e8c24fb2fb3060ff08c27d7a5a91e0f9d325bcb93c9f0b71a9d9e6d66e9f9`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
