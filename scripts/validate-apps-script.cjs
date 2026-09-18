const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const sourceDir=path.join(root,'src');
const files=fs.readdirSync(sourceDir).filter(file=>file.endsWith('.gs')).sort();
for(const file of files)new vm.Script(fs.readFileSync(path.join(sourceDir,file),'utf8'),{filename:file});
const manifestPath=path.join(sourceDir,'appsscript.json');
if(fs.existsSync(manifestPath)){
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  if(manifest.runtimeVersion!=='V8')throw new Error('appsscript.json must use V8 runtime.');
  if(!manifest.dependencies?.enabledAdvancedServices?.some(service=>service.serviceId==='drive'))throw new Error('Drive advanced service must be declared.');
  for(const scope of [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/script.external_request'
  ])if(!manifest.oauthScopes?.includes(scope))throw new Error(`Missing required OAuth scope: ${scope}`);
}
const htmlFiles=fs.readdirSync(sourceDir).filter(file=>file.endsWith('.html')).sort();
const html=htmlFiles.map(file=>fs.readFileSync(path.join(sourceDir,file),'utf8')).join('\n');
let scriptCount=0;
for(const file of htmlFiles){
  const source=fs.readFileSync(path.join(sourceDir,file),'utf8');
  for(const match of source.matchAll(/<script>([\s\S]*?)<\/script>/g)){
    new vm.Script(match[1],{filename:file+'.client.js'});
    scriptCount++;
  }
}
if(!scriptCount)throw new Error('At least one HTML client script is required.');
const allSource=files.map(file=>fs.readFileSync(path.join(sourceDir,file),'utf8')).join('\n')+'\n'+html;
if(fs.existsSync(path.join(sourceDir,'Index.html'))){
  for(const token of [
    'id="meeting-form"','id="meeting-file-panel"','id="meeting-file-home"','pitchbook-drop-zone','preparePitchbookBatch','uploadPitchbookFile',
    'parentMeetingId','expectedParentVersion','updateMeetingRelations','id="meeting-detail-card"','id="meeting-detail-files"',
    '25*1024*1024','KSP_PITCHBOOK_SLOT_KEY','id="page-meeting-past"','id="page-pitchbook-past"','id="page-masters"',
    'meeting-quick-add-counterparty','meeting-counterpartyType','meeting-counterpartyId','meeting-relatedGpIds',
    'pitchbook-quick-add-gp','searchMeetingRecords','updateMeetingMaintenance',
    'mutateMaster','quickAddGp','getPhase1MaintenanceBootstrapData','include_'
  ])if(!allSource.includes(token))throw new Error(`Source surface missing token: ${token}`);
  const index=fs.readFileSync(path.join(sourceDir,'Index.html'),'utf8');
  if(/id="(?:pitchbook-form|page-pitchbook)"/.test(index))throw new Error('Standalone Pitchbook registration is forbidden; use the parent Meeting attachment panel.');
  const navigation=index.match(/<nav\b[\s\S]*?<\/nav>/)?.[0]||'';
  if((navigation.match(/<button\b/g)||[]).length!==7)throw new Error('The accepted Light sidebar must have seven entries.');
  if(/id="nav-(?:pitchbook|pitchbook-past|relationship-explorer)"/.test(navigation))throw new Error('Parent detail must own document operations, not standalone navigation.');
}
for(const token of [
  'KSP_AI_FORMAT_REGISTRY','kspNormalizeEmlText','application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '自由質問','要約','時系列','比較','面談準備',
  'id="knowledge-mode"','searchKnowledge','getFeatureFreezeDiagnostics_',
  'runAiSyncWorker_','kspRunFeatureFreezeKnowledgeSearch_','kspRunFeatureFreezeAiSync_',
  'KSP_KNOWLEDGE_EXPORT_LIMITS','kspResolveKnowledgeExportSources',
  'previewKnowledgeExport','createKnowledgeExport','getKnowledgeExportPrompt',
  'recordKnowledgeExportPromptCopy','kspResolveKnowledgeExportSources_','Knowledge Exports','Knowledge Export'
])if(!allSource.includes(token))throw new Error(`Feature-freeze surface missing token: ${token}`);
console.log(`Validated ${files.length} Apps Script source files, ${htmlFiles.length} HTML files, and available manifest.`);
