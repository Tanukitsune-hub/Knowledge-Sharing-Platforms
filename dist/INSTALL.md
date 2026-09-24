# Private Assets Intelligence 0.1.2 installation

Source commit: `b9abea5055216eb14a5799937bacbaa53e1ed1e1`
Bundle SHA-256: `4dfdd5f58267570a3ff95a441889278ed548245820acb034e3f5983f6145a7d3`
Payload SHA-256: `b09143421247a89cb82139ee8aa5f11310ffe5ccce4d48e79b3a51a0f15def83`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
