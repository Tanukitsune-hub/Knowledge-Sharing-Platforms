# Knowledge Share 0.1.2 installation

Source commit: `363842e94182284c80001b19a4641e2a622f5ad1`  
Bundle SHA-256: `089538f7c5f15a46c71f8bcb80f5464018ffb8bb68fbea53c4ff7e4537b10d91`  
Payload SHA-256: `21dc25214b1be79bb93b178222ea4fc432bae72756d72cfcb8531eed343a9401`

1. Create a Google Spreadsheet in the intended company Drive folder.
2. Open Extensions -> Apps Script and add the Drive API service.
3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.
4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.
5. Deploy one company-restricted Web App, then run checkKnowledgeShareReadiness and confirm READY.

Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.
