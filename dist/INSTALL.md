# Knowledge Share 0.1.2 installation

Source commit: `9130aa38e9fd5c1253c2efe29286d6d9c8554273`
Bundle SHA-256: `4b81d5d9e87a37d75bb631b9b857bf8988fea3d4512d0043093d44ba9f568f56`
Payload SHA-256: `8b9a26c4ca121ab0418ab73e4d2d9471b1f27ccf5597757f80ffdf2221ad9ba2`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
