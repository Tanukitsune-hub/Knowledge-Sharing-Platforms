# Knowledge Share 0.1.2 installation

Source commit: `fdf4790785ae1c943fad09c8e4ccca160f4c3d29`
Bundle SHA-256: `57efed45ac73f53d8430922f5728701786d40592645e53f8a95a1a9dc3096541`
Payload SHA-256: `80e89e2dc632c06e34896602a5d302c31b0aa8340f5f78cdbe9f11cb897fd486`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.
6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
