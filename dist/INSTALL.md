# Alternative Assets Intelligence 0.2.0 installation

Source commit: `d7cb7e3324f7363ecc35d147ebdd39c5f038172b`
Bundle SHA-256: `cc05693d92e9d66951cf06c3c56ee88b63329d3e768a228ed58da022a04b3144`
Payload SHA-256: `3fb9fe96474dd1531a4bd5f0bee1804e12fcc40e3569b3ca65e1d880ee2a4ace`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
