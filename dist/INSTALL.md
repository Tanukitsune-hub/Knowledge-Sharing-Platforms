# Knowledge Share 0.1.2 installation

Source commit: `664aff7e0bb3c05758dc1eddcaf53492103da523`
Bundle SHA-256: `57a1b9d10e54504611698a39c18145e93ac6f8c4e51c2416ae555838634be6d9`
Payload SHA-256: `c8f9f1ef77e5fbd3248c45aebfcb12f264e358e93dac655f7d5a99377385a676`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
