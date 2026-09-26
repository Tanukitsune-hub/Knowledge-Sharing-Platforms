# Alternative Assets Intelligence 0.2.4 installation

Source commit: `844024f55ad19c4a084aadedb4f8b21aa001446c`
Bundle SHA-256: `e3164d1de9520fc60ad48e0f0deef8589ed94525fd7fe04b53d97c0a5ee5e604`
Payload SHA-256: `9e08fb72df104165eb424eb987e694d28f53c4c91d9df354ab443b39545935bd`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
