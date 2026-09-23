# Private Assets Intelligence 0.1.2 installation

Source commit: `baaa35c3a53324b25649f79204b96bc0177ee068`
Bundle SHA-256: `f3185596c84ce8386cb8f1ccbe511991d9e2bfe3e0c1836da94b9f3d0d522597`
Payload SHA-256: `b901733656a7ecb500cb352cd18ce67bc4a87af07ce48ad1f38c07af682f24b8`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
