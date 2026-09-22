# Knowledge Share 0.1.2 installation

Source commit: `15dca29b016ab8366135150762721947f18f7280`
Bundle SHA-256: `7f80346ef68360e65c1bafcbef12e6a40b90a3a756da89a950f33a7781be06bc`
Payload SHA-256: `0c0dc126938442d87d6cdf55455690cd995e55de70d987f04fab9754227a86be`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
