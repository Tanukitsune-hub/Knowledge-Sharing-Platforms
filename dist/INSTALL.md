# Knowledge Share 0.1.2 installation

Source commit: `965dd4ab35b67b17663cfd71ab60936bfe1f6de8`
Bundle SHA-256: `b32a87c0bc38e33a2408cc13e6ad10cf167b26321c84b469b935500421833fd4`
Payload SHA-256: `7eb9a6c1c28648b3e82dbeb622313de65ce771e8de34c48e6f67e2823c37f63c`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
