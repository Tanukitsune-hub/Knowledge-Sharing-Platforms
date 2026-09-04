# Knowledge Share 0.1.2 installation

Source commit: `4de21594918e4e2e7a1f76ca2c7a0ce49fe086d3`
Bundle SHA-256: `d52c2f7a4c15746c615d7a43639e3d982ba1216d150bb860f4c688a600d3ef53`
Payload SHA-256: `1317c05672abdf71b0cfb685b3bc9ba04ad1e8cf538a271a15e6fa21d1560f7d`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
