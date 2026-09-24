# Private Assets Intelligence 0.1.2 installation

Source commit: `d12857ffecab73d2f2b36725a63cf10f585a883a`
Bundle SHA-256: `48eb6f2eb68c20e820e0dfb00bd9843ac968661769853574e9b95c5efa655d64`
Payload SHA-256: `327c324ff57035bf92ee9160d1bf872941892e51d4aa9a0b5da88e17732acb06`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
