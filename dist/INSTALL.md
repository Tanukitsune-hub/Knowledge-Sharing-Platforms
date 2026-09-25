# Alternative Assets Intelligence 0.2.0 installation

Source commit: `418802156e1a8489014ff8ca53bca134a3bad00e`
Bundle SHA-256: `a227b3390b3c591399c2ef38c3cb319994fd8953fb325905bbfd229c817954d4`
Payload SHA-256: `df11281487412b089fcc1aa7f29e4adcc566f008b35f24a2c8649eb3d6c905c8`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
