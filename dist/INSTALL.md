# Knowledge Share 0.1.2 installation

Source commit: `e1ea1b9117bae227a2dabea5e30c46633fb83642`
Bundle SHA-256: `51293db4adffe7bd068a1e2f5d4099f7eeb88d5fb044c6247e62bf41ba3405ad`
Payload SHA-256: `e23c11608d0e4df5f13dcb8a79eba2252fa2dd5f64b9933ed6ef44141aa567bf`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
