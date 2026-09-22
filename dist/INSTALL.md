# Knowledge Share 0.1.2 installation

Source commit: `863012c1dc444c3bdf55ad763be3c968dbec0ff6`
Bundle SHA-256: `d5838f0c1279af994f03d7481eec9c19c60e6b4b502b15cf7573abf6e5f1665a`
Payload SHA-256: `4e90c3d12458f19bdfaa1fc8fb749763953638fd07c4afb6db97fde518634550`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
