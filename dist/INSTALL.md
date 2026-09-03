# Knowledge Share 0.1.2 installation

Source commit: `681768824f298eff24439b2ee69c9ce159af1e0e`
Bundle SHA-256: `c234c849ad86571140622ca5a4913dbf04122d9dc81642a4710a3ebabf3f5c75`
Payload SHA-256: `26b2676ce2feab29a6457c19227b0a4348f6946e4ffa2cabb4166729540eee6a`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
