# Knowledge Share 0.1.2 installation

Source commit: `d1310034b2fe6b6ff5a847108fdae22d2f8f79c7`
Bundle SHA-256: `e8a12bbe14307e52a2d1a1dbf115276c5ab13653c817eff6c599c4021d0305d3`
Payload SHA-256: `71074793445751bc201531ce80112261ca891c65d8536b5fb1c80ae28fe60d4b`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
