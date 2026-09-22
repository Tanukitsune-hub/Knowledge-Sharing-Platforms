# Knowledge Share 0.1.2 installation

Source commit: `0bae148e900f33654249587959e1c1901f4de38b`
Bundle SHA-256: `b3a22f9e7904b12a92ff6976a7f65966c71b2a7111ba248496153d97fb29ed2a`
Payload SHA-256: `a24e6e1f2db25ad537c358a5dfb8276ef402dae4a2e4ccf6ed6b7456e6013e78`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
