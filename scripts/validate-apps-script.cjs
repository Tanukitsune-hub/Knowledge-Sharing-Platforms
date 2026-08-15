const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..'),sourceDir=path.join(root,'src');
const files=fs.readdirSync(sourceDir).filter(file=>file.endsWith('.gs')).sort();
for(const file of files)new vm.Script(fs.readFileSync(path.join(sourceDir,file),'utf8'),{filename:file});
const manifestPath=path.join(sourceDir,'appsscript.json');
if(fs.existsSync(manifestPath)){
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  if(manifest.runtimeVersion!=='V8')throw new Error('appsscript.json must use V8 runtime.');
  if(!manifest.dependencies?.enabledAdvancedServices?.some(service=>service.serviceId==='drive'))throw new Error('Drive advanced service must be declared.');
  for(const scope of ['https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/documents','https://www.googleapis.com/auth/spreadsheets'])if(!manifest.oauthScopes?.includes(scope))throw new Error(`Missing required OAuth scope: ${scope}`);
}
const htmlFiles=fs.readdirSync(sourceDir).filter(file=>file.endsWith('.html')).sort();
const html=htmlFiles.map(file=>fs.readFileSync(path.join(sourceDir,file),'utf8')).join('\n');
let scriptCount=0;for(const file of htmlFiles){const source=fs.readFileSync(path.join(sourceDir,file),'utf8');for(const match of source.matchAll(/<script>([\s\S]*?)<\/script>/g)){new vm.Script(match[1],{filename:file+'.client.js'});scriptCount++;}}
if(!scriptCount)throw new Error('At least one HTML client script is required.');
const allSource=files.map(file=>fs.readFileSync(path.join(sourceDir,file),'utf8')).join('\n')+'\n'+html;
for(const token of ['id="meeting-form"','id="pitchbook-form"','pitchbook-drop-zone','preparePitchbookBatch','uploadPitchbookFile','25*1024*1024','KSP_PITCHBOOK_SLOT_KEY','id="page-meeting-past"','id="page-pitchbook-past"','id="page-masters"','searchMeetingRecords','updateMeetingMaintenance','mutateMaster','runAuditRetentionCleanup','getPhase1Diagnostics'])if(!allSource.includes(token))throw new Error(`Source surface missing token: ${token}`);
console.log(`Validated ${files.length} Apps Script source files, ${htmlFiles.length} HTML files, and available manifest.`);
