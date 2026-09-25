# Alternative Assets Intelligence 0.2.0 installation

Source commit: `25c6e62d601e6c2e7a4f3f8faf4629e8a2627904`
Bundle SHA-256: `3e31e792b1292af8b21d730e7ab2e07efcb7be74ee2f03de78daaa6f99635f88`
Payload SHA-256: `1c89c32a5ff641951f90cdb9f22609d608dd5e3e924ea245c9d77984a5a52c89`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
