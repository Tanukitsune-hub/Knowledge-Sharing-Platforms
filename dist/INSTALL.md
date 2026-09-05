# Knowledge Share 0.1.2 installation

Source commit: `11865c49b17c578713c3c1b4bc5c2307434d50e9`
Bundle SHA-256: `8d361c8354d77c54f992aac8e6f3dca690e1a9f8e3675b50c6960f9baa542952`
Payload SHA-256: `bc80c41d3650a2bc485e601d28262eda8e02b634110cc04bf4246900d48c6744`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
