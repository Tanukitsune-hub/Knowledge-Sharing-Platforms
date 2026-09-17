# Knowledge Share 0.1.2 installation

Source commit: `04fcc974cb7591d1bc866844eaa60a7901366076`
Bundle SHA-256: `2d35d78cf49180411f98c38849db07cee4702d4914a7449baa854ace5adf8e33`
Payload SHA-256: `cc7d12932be3b3eb55f43b8e217ea293ee2cfc061d11899489d7322855b4c059`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
