# Alternative Assets Intelligence 0.2.3 installation

Source commit: `de0128791e4f29739ed6979989d466086bbf7a30`
Bundle SHA-256: `ef4fa15273d16d6dfd19fe567f4fdfe75f5dfea1b19e5778bd9dc6df44377a66`
Payload SHA-256: `7e403bf2fd48701dc0eab6c8c5fd81230ee97d7821d1413016d55ba34f9ace57`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
