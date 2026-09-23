# Knowledge Share 0.1.2 installation

Source commit: `a9f4e34ec98cacfea9429e5de6c344b0cde81c02`
Bundle SHA-256: `aaf2cf1558c5d9712b9fb3e401852c0ce583df032fd9f9771ef68629eedfd038`
Payload SHA-256: `9458af07f8b6dc6595548a75ad010fa3525bb4d1dd93a7d32c8551ce749706d4`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
